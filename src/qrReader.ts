import Jimp from 'jimp';
import jsQR from 'jsqr';

export interface BuData {
    zona: string;
    secao: string;
    municipio: string;
    votos: Array<{
        cargo: string;
        candidato: string;
        quantidade: number;
    }>;
}

/**
 * Lê o código QR de um buffer de imagem e extrai os dados do BU.
 * Para 2026, estamos assumindo um formato simplificado em JSON.
 * @param imageBuffer Buffer da imagem contendo o QR Code.
 */
export const readBuQrCode = async (imageBuffer: Buffer): Promise<BuData | null> => {
    try {
        const image = await Jimp.read(imageBuffer);
        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height,
        };

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            console.log("QR Code encontrado!");
            // Assumindo que o TSE retorna um JSON para facilitar o exemplo,
            // Na realidade o BU do TSE possui um formato posicional ou hash específico
            try {
                const data: BuData = JSON.parse(code.data);
                return data;
            } catch (parseErr) {
                console.error("Erro ao parsear dados do BU:", parseErr);
                // Retorna um dado bruto ou tenta converter se for texto posicional
                return null;
            }
        } else {
            console.warn("Nenhum QR Code encontrado na imagem.");
            return null;
        }
    } catch (err) {
        console.error("Erro ao processar imagem do QR Code:", err);
        return null;
    }
};
