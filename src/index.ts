import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { readBuQrCode } from './qrReader';
import { supabase } from './db';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração do Multer para receber a imagem em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint para receber o BU (imagem do QRCode)
app.post('/upload-bu', upload.single('bu_image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada. Envie como form-data na chave "bu_image".' });
        }

        console.log(`Processando imagem: ${req.file.originalname}`);
        
        const buData = await readBuQrCode(req.file.buffer);

        if (!buData) {
            return res.status(422).json({ error: 'Não foi possível ler os dados do BU a partir do QRCode da imagem.' });
        }

        // Armazenar os dados no banco de dados via Supabase
        
        // 1. Inserir o Boletim de Urna
        const { data: buInsertRes, error: buError } = await supabase
            .from('boletins_urna')
            .insert([{
                zona: buData.zona,
                secao: buData.secao,
                municipio: buData.municipio
            }])
            .select()
            .single();

        if (buError) {
            console.error('Erro ao inserir BU:', buError);
            return res.status(500).json({ error: 'Erro ao salvar o Boletim de Urna no banco.' });
        }

        const buId = buInsertRes.id;

        // 2. Inserir os votos
        const votosToInsert = buData.votos.map(voto => ({
            boletim_urna_id: buId,
            cargo: voto.cargo,
            candidato: voto.candidato,
            quantidade: voto.quantidade
        }));

        const { error: votosError } = await supabase
            .from('votos')
            .insert(votosToInsert);

        if (votosError) {
            console.error('Erro ao inserir votos:', votosError);
            // Idealmente faríamos um rollback ou apagaríamos o BU inserido se der erro.
            // Aqui podemos deletar o BU para manter consistência, já que o Supabase REST não suporta transações longas nativamente (sem usar RPC).
            await supabase.from('boletins_urna').delete().eq('id', buId);
            return res.status(500).json({ error: 'Erro ao salvar os votos no banco de dados.' });
        }
            
        res.status(200).json({
            message: 'BU lido e armazenado com sucesso!',
            data: buData
        });

    } catch (err) {
        console.error('Erro interno:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Endpoint para receber o BU já como texto lido pela câmera do navegador
app.post('/upload-bu-text', async (req, res) => {
    try {
        const buData = req.body.buData;

        if (!buData || !buData.zona) {
            return res.status(422).json({ error: 'Dados inválidos do QR Code.' });
        }

        // Armazenar os dados no banco de dados via Supabase
        
        // 1. Inserir o Boletim de Urna
        const { data: buInsertRes, error: buError } = await supabase
            .from('boletins_urna')
            .insert([{
                zona: buData.zona,
                secao: buData.secao,
                municipio: buData.municipio
            }])
            .select()
            .single();

        if (buError) {
            console.error('Erro ao inserir BU:', buError);
            return res.status(500).json({ error: 'Erro ao salvar o Boletim de Urna no banco.' });
        }

        const buId = buInsertRes.id;

        // 2. Inserir os votos
        const votosToInsert = buData.votos.map((voto: any) => ({
            boletim_urna_id: buId,
            cargo: voto.cargo,
            candidato: voto.candidato,
            quantidade: voto.quantidade
        }));

        const { error: votosError } = await supabase
            .from('votos')
            .insert(votosToInsert);

        if (votosError) {
            console.error('Erro ao inserir votos:', votosError);
            await supabase.from('boletins_urna').delete().eq('id', buId);
            return res.status(500).json({ error: 'Erro ao salvar os votos no banco de dados.' });
        }
            
        res.status(200).json({
            message: 'BU lido e armazenado com sucesso!',
            data: buData
        });

    } catch (err) {
        console.error('Erro interno:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.get('/resultados', async (req, res) => {
    try {
        // Agrupar e somar os votos
        // O Supabase não possui "GROUP BY" nativo na API REST, então usamos uma RPC ou buscamos tudo.
        // Para uma aplicação real de apuração, o ideal é criar uma "View" no Supabase e consumi-la, ou usar uma Stored Procedure (RPC).
        // Aqui faremos a chamada a uma view imaginária chamada "resumo_votos".
        
        const { count: buCount, error: buError } = await supabase
            .from('boletins_urna')
            .select('*', { count: 'exact', head: true });

        const { data, error } = await supabase
            .from('votos')
            .select('cargo, candidato, quantidade');

        if (error || buError) {
            throw error || buError;
        }

        // Agrupamento manual no backend para simplificar o exemplo sem precisar criar RPC no Supabase
        const agrupado: Record<string, number> = {};
        data.forEach(v => {
            const key = `${v.cargo}:::${v.candidato}`;
            if (!agrupado[key]) agrupado[key] = 0;
            agrupado[key] += v.quantidade;
        });

        const result = Object.entries(agrupado).map(([key, quantidade]) => {
            const [cargo, candidato] = key.split(':::');
            return { cargo, candidato, total_votos: quantidade };
        });

        // Ordenando: cargo, depois total_votos DESC
        result.sort((a, b) => {
            if (a.cargo < b.cargo) return -1;
            if (a.cargo > b.cargo) return 1;
            return b.total_votos - a.total_votos;
        });

        res.json({
            secoes_apuradas: buCount || 0,
            votos: result
        });
    } catch (err) {
        console.error('Erro ao consultar resultados:', err);
        res.status(500).json({ error: 'Erro ao consultar resultados.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor de Apuração Eleitoral rodando na porta ${port}`);
    console.log(`Conectado ao Supabase no endereço: ${process.env.SUPABASE_URL}`);
});
