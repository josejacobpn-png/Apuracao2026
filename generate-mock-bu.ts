import QRCode from 'qrcode';

const mockBuData = {
    zona: "001",
    secao: "105",
    municipio: "SÃO PAULO",
    votos: [
        { cargo: "Presidente", candidato: "99 - Candidato A", quantidade: 120 },
        { cargo: "Presidente", candidato: "88 - Candidato B", quantidade: 85 },
        { cargo: "Presidente", candidato: "NULO", quantidade: 5 },
        { cargo: "Governador", candidato: "77 - Candidato C", quantidade: 150 }
    ]
};

const jsonString = JSON.stringify(mockBuData);

QRCode.toFile('mock-bu-qrcode.png', jsonString, {
    errorCorrectionLevel: 'H'
}, function (err) {
    if (err) throw err;
    console.log('Imagem QR Code gerada com sucesso: mock-bu-qrcode.png');
    console.log('Agora você pode enviar este arquivo para a rota /upload-bu');
});
