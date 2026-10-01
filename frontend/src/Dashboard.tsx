import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { LayoutDashboard, FileText, Calendar, Filter, ArrowLeft } from 'lucide-react';
import './Dashboard.css';

interface Resultado {
  cargo: string;
  candidato: string;
  total_votos: number;
}

interface DashboardProps {
  resultados: { secoes_apuradas: number, votos: Resultado[] };
  onBack: () => void;
}

export default function Dashboard({ resultados, onBack }: DashboardProps) {
  // Agrupar votos por cargo
  const getVotosPorCargo = (nomeCargo: string) => {
    const filtrados = resultados.votos.filter(v => v.cargo.toLowerCase() === nomeCargo.toLowerCase());
    return filtrados.map(v => ({
      name: v.candidato.split(' - ')[1] || v.candidato,
      votos: v.total_votos
    }));
  };

  const votosPresidente = getVotosPorCargo('Presidente');
  const votosGovernador = getVotosPorCargo('Governador');
  const votosSenador = getVotosPorCargo('Senador');
  const votosDepFederal = getVotosPorCargo('Deputado Federal');
  const votosDepEstadual = getVotosPorCargo('Deputado Estadual');

  const totalGeral = resultados.votos.reduce((acc, v) => acc + v.total_votos, 0);

  return (
    <div className="dash-container">
      {/* Menu Lateral (Dark Blue) */}
      <aside className="dash-sidebar">
        <h2 className="dash-logo">MENU</h2>
        
        <div className="dash-nav">
          <button className="dash-btn-nav active">
            <div className="dash-icon-box yellow">
              <LayoutDashboard size={24} color="#0a1931" />
            </div>
            <span>PÁGINA 1</span>
          </button>
          
          <button className="dash-btn-nav">
            <div className="dash-icon-box">
              <FileText size={24} color="#fff" />
            </div>
            <span>PÁGINA 2</span>
          </button>
          
          <button className="dash-btn-nav">
            <div className="dash-icon-box">
              <Calendar size={24} color="#fff" />
            </div>
            <span>FILTRO DE DATA</span>
          </button>
        </div>

        <div className="dash-filter-section">
          <button className="dash-btn-filter">FILTRO</button>
          <label className="dash-checkbox"><input type="checkbox" defaultChecked /> Votos Totais</label>
          <label className="dash-checkbox"><input type="checkbox" defaultChecked /> Seções Apuradas</label>
        </div>
      </aside>

      {/* Conteúdo Principal (Gradient Background) */}
      <main className="dash-main">
        <header className="dash-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="dash-back-btn" onClick={onBack} title="Voltar">
              <ArrowLeft size={24} />
            </button>
            <h1>GRÁFICOS – APURAÇÃO 2026</h1>
          </div>
          
          <div className="dash-top-filters">
             <div className="dash-top-filter-label">FILTROS</div>
             <div className="dash-tabs">
               <button className="dash-tab active">Cargo</button>
               <button className="dash-tab">Seção</button>
               <button className="dash-tab dark">Zona</button>
             </div>
          </div>
        </header>

        <div className="dash-kpis">
          <div className="dash-kpi-card">
            <div className="dash-kpi-value">{resultados.secoes_apuradas}</div>
            <div className="dash-kpi-label">Seções Apuradas</div>
          </div>
          <div className="dash-kpi-card">
            <div className="dash-kpi-value">{totalGeral}</div>
            <div className="dash-kpi-label">Votos Totais Contabilizados</div>
          </div>
        </div>

        <div className="dash-grid-6">
          
          {/* Card 1: Senador 2ª Vaga */}
          <div className="dash-card">
            <h3>SENADOR (2ª VAGA)</h3>
            <div className="dash-legend"><span className="dot yellow"></span> Votos Totais</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votosSenador} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <XAxis type="number" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a1931', border: 'none', color: '#fff' }} />
                  <Bar dataKey="votos" fill="#f1c40f" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Presidente */}
          <div className="dash-card">
            <h3>PRESIDENTE</h3>
            <div className="dash-legend"><span className="dot yellow"></span> Votos Totais</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votosPresidente} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <XAxis type="number" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a1931', border: 'none', color: '#fff' }} />
                  <Bar dataKey="votos" fill="#f1c40f" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Governador */}
          <div className="dash-card">
            <h3>GOVERNADOR</h3>
            <div className="dash-legend"><span className="dot yellow"></span> Votos Totais</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votosGovernador} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <XAxis type="number" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a1931', border: 'none', color: '#fff' }} />
                  <Bar dataKey="votos" fill="#f1c40f" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 4: Senador 1ª Vaga */}
          <div className="dash-card">
            <h3>SENADOR (1ª VAGA)</h3>
            <div className="dash-legend"><span className="dot yellow"></span> Votos Totais</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votosSenador} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <XAxis type="number" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a1931', border: 'none', color: '#fff' }} />
                  <Bar dataKey="votos" fill="#f1c40f" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 5: Deputado Federal */}
          <div className="dash-card">
            <h3>DEPUTADO FEDERAL</h3>
            <div className="dash-legend"><span className="dot yellow"></span> Votos Totais</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votosDepFederal} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <XAxis type="number" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a1931', border: 'none', color: '#fff' }} />
                  <Bar dataKey="votos" fill="#f1c40f" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 6: Deputado Estadual */}
          <div className="dash-card">
            <h3>DEPUTADO ESTADUAL</h3>
            <div className="dash-legend"><span className="dot yellow"></span> Votos Totais</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votosDepEstadual} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <XAxis type="number" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a0aabf" tick={{fill: '#a0aabf', fontSize: 10}} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a1931', border: 'none', color: '#fff' }} />
                  <Bar dataKey="votos" fill="#f1c40f" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
