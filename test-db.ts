import { supabase } from './src/db';

async function testInsert() {
    const { data, error } = await supabase
        .from('boletins_urna')
        .insert([{
            zona: "999",
            secao: "999",
            municipio: "TESTE"
        }])
        .select()
        .single();

    if (error) {
        console.error("Erro ao inserir:", error);
    } else {
        console.log("Inserido com sucesso:", data);
        // clean up
        await supabase.from('boletins_urna').delete().eq('id', data.id);
    }
}

testInsert().catch(console.error);
