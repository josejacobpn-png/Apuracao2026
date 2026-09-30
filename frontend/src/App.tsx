import { useState, useRef } from 'react';
import { ArrowRight, QrCode, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({ type: 'loading' });

    const formData = new FormData();
    formData.append('bu_image', file);

    try {
      // Usamos a porta 3000 onde o backend está rodando
      const response = await fetch('http://localhost:3000/upload-bu', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Boletim de Urna processado e enviado com sucesso!' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erro ao processar BU.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro de conexão com o servidor. Verifique se o backend está rodando.' });
    }

    // Reseta o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="app-container">
        {!isLoggedIn ? (
          <form onSubmit={handleLogin}>
            <h1>Apuração Eleitoral</h1>
            <p className="subtitle">Sistema oficial de transmissão de BUs</p>
            
            <div className="input-group">
              <label htmlFor="username">Identificação do Mesário/Auditor</label>
              <input 
                id="username"
                type="text" 
                className="input-field" 
                placeholder="Digite seu nome completo ou ID..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn" 
              disabled={!username.trim()}
            >
              Acessar Sistema
              <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <div>
            <h1>Bem-vindo, {username.split(' ')[0]}</h1>
            <p className="subtitle">Pronto para transmitir os resultados.</p>

            <div className="scanner-area" onClick={triggerFileInput}>
              <QrCode size={48} className="scanner-icon" />
              <p style={{ color: 'var(--text-secondary)' }}>
                Clique aqui para ler o QR Code ou <br/>fazer upload da imagem do BU
              </p>
              <button type="button" className="btn" style={{ width: 'auto', padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}>
                <Upload size={18} /> Selecionar Arquivo
              </button>
            </div>

            <input 
              type="file" 
              accept="image/*"
              className="hidden-file-input" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {status.type === 'loading' && (
              <div className="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Loader2 size={18} className="scanner-icon" /> Processando imagem...
              </div>
            )}
            
            {status.type === 'success' && (
              <div className="status success">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <CheckCircle size={18} /> Sucesso
                </div>
                {status.message}
              </div>
            )}
            
            {status.type === 'error' && (
              <div className="status error">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <AlertCircle size={18} /> Erro
                </div>
                {status.message}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
