// src/components/Unicos.jsx
import { useState } from 'react';

export default function Unicos({ allGames, allData }) {
  const names = Object.keys(allData);
  const [expanded, setExpanded] = useState({});

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {names.map(name => {
        const unique = Object.values(allGames)
          .filter(g=>g.owners.length===1&&g.owners[0]===name)
          .sort((a,b)=>b.totalHours-a.totalHours);
        const isExpanded = expanded[name];
        const shown = isExpanded ? unique : unique.slice(0,60);
        return (
          <div key={name} style={{ marginBottom:32 }}>
            <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:12 }}>
              {name} — {unique.length} jogos exclusivos
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {shown.map(g=>(
                <div key={g.appid} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'5px 14px', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                  {g.name}
                  <span style={{ background:'linear-gradient(135deg,var(--blue),var(--cyan))', color:'#000', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>
                    {g.totalHours.toFixed(0)}h
                  </span>
                </div>
              ))}
              {!isExpanded && unique.length>60 &&
                <div onClick={()=>setExpanded(p=>({...p,[name]:true}))} style={{ background:'var(--surface)', border:'1px solid var(--blue)', borderRadius:20, padding:'5px 14px', fontSize:13, color:'var(--blue)', cursor:'pointer' }}>
                  +{unique.length-60} mais
                </div>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
