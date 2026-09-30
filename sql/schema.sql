CREATE TABLE IF NOT EXISTS boletins_urna (
    id SERIAL PRIMARY KEY,
    zona VARCHAR(10) NOT NULL,
    secao VARCHAR(10) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    data_recebimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votos (
    id SERIAL PRIMARY KEY,
    boletim_urna_id INTEGER REFERENCES boletins_urna(id) ON DELETE CASCADE,
    cargo VARCHAR(50) NOT NULL,
    candidato VARCHAR(100) NOT NULL,
    quantidade INTEGER NOT NULL
);
