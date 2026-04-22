// src/App.jsx
import { useState, useEffect } from 'react';
import { useSteamData } from './hooks/useSteamData';
import SetupPanel from './components/SetupPanel';
import LoadingPanel from './components/LoadingPanel';
import VisaoGeral from './components/VisaoGeral';
import Biblioteca from './components/Biblioteca';
import EmComum from './components/EmComum';
import Unicos from './components/Unicos';

const TABS = [
  { id:'visao-geral', label:'Visão Geral' },
  { id:'biblioteca',  label:'Biblioteca' },
  { id:'em-comum',    label:'Em Comum' },
  { id:'unicos',      label:'Únicos' },
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [tab, setTab] = useState('visao-geral');
  const { phase, loadingMsg, loadingStep, loadingTotal, allData, allGames, players, load, reset } = useSteamData();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t==='dark'?'light':'dark');

  const headerBg = theme==='dark' ? 'rgba(9,12,20,0.9)' : 'rgba(240,244,248,0.9)';

  return (
    <>
      {/* HEADER */}
      <header style={{ borderBottom:'1px solid var(--border)', background:headerBg, backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100, padding:'14px 0' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', gap:16, position:'relative', zIndex:1 }}>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:22, fontWeight:700, letterSpacing:3, background:'linear-gradient(90deg,var(--blue),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            STEAM<span style={{ color:'var(--muted)', WebkitTextFillColor:'var(--muted)', fontWeight:400, fontSize:13, letterSpacing:1, marginLeft:8 }}>FAMILY HUB</span>
          </div>

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
            {phase==='done' && (
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 8px var(--green)', animation:'pulse 2s infinite', display:'inline-block' }} />
                {Object.keys(allData).length} contas carregadas
              </div>
            )}
            <button onClick={toggleTheme} title="Alternar tema" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 12px', cursor:'pointer', fontSize:16, lineHeight:1, color:'var(--text)' }}>
              {theme==='dark'?'☀️':'🌙'}
            </button>
            {phase==='done' && (
              <button onClick={reset} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'8px 16px', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
                ⟵ Reconfigurar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* PANELS */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>
        {phase === 'setup'   && <SetupPanel onLoad={load} />}
        {phase === 'loading' && <LoadingPanel msg={loadingMsg} step={loadingStep} total={loadingTotal} />}

        {phase === 'done' && (
          <div style={{ padding:'32px 0 60px' }}>
            {/* Tabs */}
            <div style={{ display:'flex', gap:4, marginBottom:28, borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 20px', cursor:'pointer', border:'none', background:'none', color: tab===t.id?'var(--blue)':'var(--muted)', borderBottom: tab===t.id?'2px solid var(--blue)':'2px solid transparent', transition:'.2s', whiteSpace:'nowrap' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab==='visao-geral' && <VisaoGeral allData={allData} allGames={allGames} players={players} />}
            {tab==='biblioteca'  && <Biblioteca allGames={allGames} />}
            {tab==='em-comum'    && <EmComum allGames={allGames} allData={allData} />}
            {tab==='unicos'      && <Unicos allGames={allGames} allData={allData} />}
          </div>
        )}
      </div>
    </>
  );
}
