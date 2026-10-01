import { useState, useRef, useEffect } from 'react';
import { ArrowRight, QrCode, Upload, CheckCircle, AlertCircle, Loader2, BarChart2, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './index.css';
import Dashboard from './Dashboard';

interface Resultado {
  cargo: string;
  candidato: string;
  total_votos: number;
}

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'upload' | 'results'>('upload');
  const [showLiveScanner, setShowLiveScanner] = useState(false);
  const [resultados, setResultados] = useState<{ secoes_apuradas: number, votos: Resultado[] }>({ secoes_apuradas: 0, votos: [] });
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (showLiveScanner) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: {width: 250, height: 250}, aspectRatio: 1.0 },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on unmount. ", error);
        });
      }
    };
  }, [showLiveScanner]);

  const onScanSuccess = async (decodedText: string) => {
    // Parar o scanner assim que ler
    setShowLiveScanner(false);
    setStatus({ type: 'loading' });

    try {
      const buData = JSON.parse(decodedText);
      const response = await fetch('http://localhost:3000/upload-bu-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buData }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Boletim de Urna lido com sucesso! Encerrando sessão...' });
        setTimeout(() => {
          setIsLoggedIn(false);
          setUsername('');
          setStatus({ type: 'idle' });
        }, 3000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Erro ao processar BU.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Erro ao processar o QR Code. Formato inválido ou erro no servidor.' });
    }
  };

  const onScanFailure = () => {
    // Ignore as it will fail constantly when no QR code is in front of the camera
  };

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
        setStatus({ type: 'success', message: 'Boletim de Urna processado com sucesso! Encerrando sessão...' });
        setTimeout(() => {
          setIsLoggedIn(false);
          setUsername('');
          setStatus({ type: 'idle' });
        }, 3000);
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

  const fetchResultados = async () => {
    setViewMode('results');
    setLoadingResultados(true);
    try {
      const response = await fetch('http://localhost:3000/resultados');
      const data = await response.json();
      if (response.ok) {
        setResultados(data);
      }
    } catch (err) {
      console.error('Erro ao buscar resultados', err);
    } finally {
      setLoadingResultados(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (viewMode === 'results' && !loadingResultados) {
    return <Dashboard resultados={resultados} onBack={() => setViewMode('upload')} />;
  }

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
              <label htmlFor="username">Identificação do Fiscal/Responsável</label>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>Bem-vindo, {username.split(' ')[0]}</h1>
                <p className="subtitle">Pronto para transmitir os resultados.</p>
              </div>
              {username.toLowerCase() === 'g2autodev@gmail.com' && (
                <button 
                  className="btn" 
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  onClick={viewMode === 'upload' ? fetchResultados : () => setViewMode('upload')}
                >
                  {viewMode === 'upload' ? <><BarChart2 size={16}/> Resultados</> : <><Upload size={16}/> Novo BU</>}
                </button>
              )}
            </div>

            {viewMode === 'upload' ? (
              <>
                {showLiveScanner ? (
                  <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', padding: '1rem', marginBottom: '1rem' }}>
                    <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', color: 'black' }}></div>
                    <button type="button" className="btn" style={{ background: '#e74c3c', marginTop: '1rem' }} onClick={() => setShowLiveScanner(false)}>
                      Cancelar Câmera
                    </button>
                  </div>
                ) : (
                  <div className="scanner-area">
                    <QrCode size={48} className="scanner-icon" />
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Como deseja realizar a leitura do BU?
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button type="button" className="btn" style={{ width: 'auto', padding: '0.75rem 1.5rem', flex: 1, minWidth: '200px' }} onClick={() => setShowLiveScanner(true)}>
                        <Camera size={18} /> Abrir Câmera ao Vivo
                      </button>
                      <button type="button" className="btn" style={{ width: 'auto', padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)', flex: 1, minWidth: '200px' }} onClick={triggerFileInput}>
                        <Upload size={18} /> Enviar Arquivo/Foto
                      </button>
                    </div>
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*"
                  capture="environment"
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
              </>
            ) : (
              <>
                {loadingResultados && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loader2 size={24} className="scanner-icon" />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
