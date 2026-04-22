// src/components/EmComum.jsx
import { useState, useMemo } from 'react';
import { CATEGORY_IDS } from '../lib/steam';

const FILTERS = [
  { key: 'all',        label: 'Todos',              icon: '🎮', catId: null },
  { key: 'multi',      label: 'Multiplayer',         icon: '👥', catId: CATEGORY_IDS.multiplayer.id },
  { key: 'coop',       label: 'Co-op',               icon: '🤝', catId: CATEGORY_IDS.coop.id },
  { key: 'onlineCoop', label: 'Co-op Online',        icon: '🌐', catId: CATEGORY_IDS.onlineCoop.id },
  { key: 'localCoop',  label: 'Co-op Local',         icon: '🛋️', catId: CATEGORY_IDS.localCoop.id },
  { key: 'localMulti', label: 'Multi Local',          icon: '🕹️', catId: CATEGORY_IDS.localMulti.id },
  { key: 'remote',     label: 'Remote Play',         icon: '📡', catId: CATEGORY_IDS.remotePlay.id },
];

function Pill({ name, onClick, expandable }) {
  return (
    <div onClick={onClick} style={{ background:'var(--surface)', border:`1px solid ${expandable?'var(--blue)':'var(--border)'}`, borderRadius:20, padding:'5px 14px', fontSize:13, display:'flex', alignItems:'center', gap:8, cursor: expandable?'pointer':'default', color: expandable?'var(--blue)':'var(--text)', transition:'.2s' }}>
      {name}
    </div>
  );
}

export default function EmComum({ allGames, allData }) {
  const names = Object.keys(allData);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedPairs, setExpandedPairs] = useState({});

  const filterCatId = FILTERS.find(f=>f.key===activeFilter)?.catId;

  const filterGames = (games) => {
    if (!filterCatId) return games;
    return games.filter(g => g.categories?.includes(filterCatId));
  };

  const allCommon = useMemo(() => {
    const base = Object.values(allGames).filter(g=>g.owners.length===names.length);
    return filterGames(base).sort((a,b)=>a.name.localeCompare(b.name));
  }, [allGames, names, activeFilter, filterCatId]);

  const pairs = useMemo(() => {
    const result = [];
    for (let i=0;i<names.length;i++) {
      for (let j=i+1;j<names.length;j++) {
        const a=names[i], b=names[j];
        const common = Object.values(allGames).filter(g=>g.owners.includes(a)&&g.owners.includes(b));
        const filtered = filterGames(common).sort((x,y)=>x.name.localeCompare(y.name));
        result.push({ a, b, games: filtered });
      }
    }
    return result;
  }, [allGames, names, activeFilter, filterCatId]);

  const filterBtn = (f) => (
    <button key={f.key} onClick={()=>setActiveFilter(f.key)} style={{ background: activeFilter===f.key?'rgba(79,172,254,0.1)':'var(--surface)', border:`1px solid ${activeFilter===f.key?'var(--blue)':'var(--border)'}`, borderRadius:8, padding:'8px 14px', color: activeFilter===f.key?'var(--blue)':'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600, letterSpacing:1, cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
      {f.icon} {f.label}
    </button>
  );

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {/* Filter bar */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {FILTERS.map(filterBtn)}
      </div>

      {/* Nota sobre categorias */}
      {activeFilter !== 'all' && (
        <div style={{ background:'rgba(79,172,254,0.06)', border:'1px solid rgba(79,172,254,0.2)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--muted)', marginBottom:20 }}>
          ℹ️ Categorias carregadas via cache diário. Jogos muito recentes ou gratuitos podem não ter dados de categoria ainda.
        </div>
      )}

      {/* Todos em comum */}
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:12 }}>
        Todos têm em comum — {allCommon.length} jogos
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:32 }}>
        {allCommon.length
          ? allCommon.map(g=><Pill key={g.appid} name={g.name} />)
          : <span style={{ color:'var(--muted)', fontSize:14 }}>Nenhum jogo em comum entre todas as contas{activeFilter!=='all'?' com esse filtro':''}.</span>
        }
      </div>

      {/* Pares */}
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>
        Por dupla
      </div>
      {pairs.map(({a,b,games}) => {
        const key = `${a}|${b}`;
        const expanded = expandedPairs[key];
        const shown = expanded ? games : games.slice(0, 40);
        const remaining = games.length - 40;
        return (
          <div key={key} style={{ marginBottom:28 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text)' }}>
              {a} <span style={{ color:'var(--muted)' }}>×</span> {b}
              <span style={{ color:'var(--muted)', fontWeight:400, marginLeft:8 }}>({games.length} jogos)</span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {games.length
                ? <>
                    {shown.map(g=><Pill key={g.appid} name={g.name} />)}
                    {!expanded && remaining>0 &&
                      <Pill name={`+${remaining} mais`} expandable onClick={()=>setExpandedPairs(p=>({...p,[key]:true}))} />
                    }
                  </>
                : <span style={{ color:'var(--muted)', fontSize:13 }}>Nenhum em comum{activeFilter!=='all'?' com esse filtro':''}</span>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
