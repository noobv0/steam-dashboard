// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSteamData } from './hooks/useSteamData';
import VisaoGeral from './components/VisaoGeral';
import Biblioteca from './components/Biblioteca';
import EmComum from './components/EmComum';
import Unicos from './components/Unicos';

const TABS = [
  { id:'visao-geral', label:'Visão Geral' },
  { id:'biblioteca',  label:'Biblioteca' },
  { id:'em-comum',    label:'Em Comum'   },
  { id:'unicos',      label:'Únicos'     },
];

export default function App() {
  const [theme, setTheme]       = useState('dark');
  const [tab, setTab]           = useState('visao-geral');
  const [tabKey, setTabKey]     = useState(0); // force remount for fade
  const [switching, setSwitching] = useState(false);
  const { phase, allData, allGames, players } = useSteamData();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Start transition class
    document.body.classList.add('theme-transitioning');
    setSwitching(true);
    setTimeout(() => {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
      setSwitching(false);
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 450);
    }, 180);
  }, []);

  const switchTab = useCallback((id) => {
    if (id === tab) return;
    setTab(id);
    setTabKey(k => k + 1);
  }, [tab]);

  const hasData = Object.keys(allData).length > 0;
  const headerBg = theme === 'dark' ? 'rgba(5,8,15,0.92)' : 'rgba(255,255,255,0.92)';

  return (
    <>
      <header style={{ borderBottom:'1px solid var(--border)', background:headerBg, backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100, padding:'14px 0' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', gap:16, position:'relative', zIndex:1 }}>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:22, fontWeight:700, letterSpacing:3, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            STEAM<span style={{ color:'var(--muted)', WebkitTextFillColor:'var(--muted)', fontWeight:400, fontSize:13, letterSpacing:1, marginLeft:8 }}>KIN</span>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
            {hasData && (
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 8px var(--cyan)44', animation:'pulse 2s infinite', display:'inline-block' }} />
                {Object.keys(allData).length} contas • {new Date().toLocaleDateString('pt-BR')}
              </div>
            )}
            <button
              className={`theme-btn${switching ? ' switching' : ''}`}
              onClick={toggleTheme}
              title="Alternar tema"
            >
              <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>
        {!hasData ? (
          <div style={{ padding:'60px 24px', textAlign:'center' }}>
            <div style={{ fontSize:18, color:'var(--muted)', marginBottom:16 }}>⏳ Nenhum dado carregado ainda</div>
            <div style={{ fontSize:14, color:'var(--muted)' }}>
              Execute o script de sincronização:<br />
              <code style={{ background:'var(--surface)', padding:'8px 12px', borderRadius:6, display:'inline-block', marginTop:8, fontFamily:'monospace' }}>
                npm run sync-steam
              </code>
            </div>
          </div>
        ) : (
          <div style={{ padding:'32px 0 60px' }}>
            {/* Tabs */}
            <div style={{ display:'flex', gap:4, marginBottom:28, borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => switchTab(t.id)} style={{
                  fontFamily:'Rajdhani,sans-serif', fontSize:14, fontWeight:600, letterSpacing:1,
                  textTransform:'uppercase', padding:'10px 20px', cursor:'pointer', border:'none',
                  background:'none', color: tab === t.id ? 'var(--blue)' : 'var(--muted)',
                  borderBottom: tab === t.id ? '2px solid var(--blue)' : '2px solid transparent',
                  transition:'color .2s, border-color .2s', whiteSpace:'nowrap',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div key={tabKey} className="tab-fade">
              {tab === 'visao-geral' && <VisaoGeral allData={allData} allGames={allGames} players={players} />}
              {tab === 'biblioteca'  && <Biblioteca allGames={allGames} />}
              {tab === 'em-comum'    && <EmComum allGames={allGames} allData={allData} />}
              {tab === 'unicos'      && <Unicos allGames={allGames} allData={allData} />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
