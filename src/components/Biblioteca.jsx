// src/components/Biblioteca.jsx
import { useState, useMemo, useRef, useEffect } from 'react';

const PAGE_SIZE = 50;

function GameTooltip({ game, pos }) {
  if (!game) return null;
  const headerImg = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
  const style = {
    position: 'fixed',
    left: pos.x + 16,
    top: pos.y - 60,
    zIndex: 9999,
    pointerEvents: 'none',
    width: 300,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    opacity: 1,
    transform: 'scale(1)',
    transition: 'opacity .15s ease, transform .15s ease',
  };
  return (
    <div style={style}>
      <img src={headerImg} style={{ width:'100%', display:'block', height:140, objectFit:'cover' }}
        onError={e=>{ e.target.style.display='none'; }} />
      <div style={{ padding:'10px 14px' }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:15, fontWeight:700, marginBottom:4 }}>{game.name}</div>
        <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--muted)' }}>
          <span>⏱ {game.totalHours.toFixed(1)}h</span>
          {game.price && <span>💰 {game.price}</span>}
          <span>👥 {game.owners.length === 1 ? `só ${game.owners[0]}` : game.owners.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}

export default function Biblioteca({ allGames }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [sortKey, setSortKey] = useState('hours');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage]       = useState(1);
  const [hovered, setHovered] = useState(null); // { game, x, y }

  const games = useMemo(() => {
    let list = Object.values(allGames);
    const q = search.toLowerCase();
    if (q) list = list.filter(g => g.name.toLowerCase().includes(q));
    if (filter === 'unique') list = list.filter(g => g.owners.length === 1);
    if (filter === 'shared') list = list.filter(g => g.owners.length > 1);
    list.sort((a, b) => {
      if (sortKey === 'name')   return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === 'owners') return sortAsc ? a.owners.length - b.owners.length : b.owners.length - a.owners.length;
      return sortAsc ? a.totalHours - b.totalHours : b.totalHours - a.totalHours;
    });
    return list;
  }, [allGames, search, filter, sortKey, sortAsc]);

  const pages = Math.ceil(games.length / PAGE_SIZE);
  const slice = games.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const sort = key => { if (sortKey===key) setSortAsc(p=>!p); else { setSortKey(key); setSortAsc(false); } setPage(1); };

  const filterBtn = (f, label) => (
    <button onClick={()=>{setFilter(f);setPage(1);}} style={{ background: filter===f?'rgba(79,172,254,0.08)':'var(--surface)', border:`1px solid ${filter===f?'var(--blue)':'var(--border)'}`, borderRadius:8, padding:'10px 16px', color: filter===f?'var(--blue)':'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600, letterSpacing:1, cursor:'pointer', whiteSpace:'nowrap' }}>{label}</button>
  );
  const thStyle = (k) => ({ textAlign:'left', padding:'10px 14px', fontFamily:'Rajdhani,sans-serif', fontSize:12, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color: sortKey===k?'var(--blue)':'var(--muted)', borderBottom:'1px solid var(--border)', cursor:'pointer', whiteSpace:'nowrap', userSelect:'none' });

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {hovered && <GameTooltip game={hovered.game} pos={hovered} />}

      <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Buscar jogo..."
          style={{ flex:1, minWidth:200, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontFamily:'JetBrains Mono,monospace', fontSize:13, outline:'none' }} />
        {filterBtn('all','Todos')}
        {filterBtn('shared','Compartilhados')}
        {filterBtn('unique','Únicos')}
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, tableLayout:'fixed' }}>
          <colgroup>
            <col style={{ width:42 }} />
            <col style={{ width:'35%' }} />
            <col />
            <col style={{ width:120 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle('img')}>#</th>
              <th style={thStyle('name')} onClick={()=>sort('name')}>Jogo {sortKey==='name'?(sortAsc?'↑':'↓'):'↕'}</th>
              <th style={thStyle('owners')} onClick={()=>sort('owners')}>Donos {sortKey==='owners'?(sortAsc?'↑':'↓'):'↕'}</th>
              <th style={thStyle('hours')} onClick={()=>sort('hours')}>Horas {sortKey==='hours'?(sortAsc?'↑':'↓'):'↓'}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((g, i) => {
              const idx = (page-1)*PAGE_SIZE+i+1;
              const isUnique = g.owners.length === 1;
              return (
                <tr key={g.appid}
                  style={{ borderBottom:'1px solid rgba(30,45,74,0.5)', cursor:'default', transition:'background .15s' }}
                  onMouseEnter={e => setHovered({ game: g, x: e.clientX, y: e.clientY })}
                  onMouseMove={e  => setHovered(h => h ? { ...h, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <td style={{ padding:'10px 14px', color:'var(--muted)', fontSize:12, verticalAlign:'middle' }}>{idx}</td>
                  <td style={{ padding:'10px 14px', verticalAlign:'middle', overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <img src={g.img} style={{ width:80, height:30, borderRadius:4, objectFit:'cover', flexShrink:0, background:'var(--surface2)' }} onError={e=>e.target.style.display='none'} />
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px', verticalAlign:'middle', overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, fontFamily:'JetBrains Mono,monospace', fontWeight:500, background: isUnique?'rgba(57,255,20,0.15)':'rgba(79,172,254,0.15)', color: isUnique?'var(--green)':'var(--blue)', border:`1px solid ${isUnique?'rgba(57,255,20,0.3)':'rgba(79,172,254,0.3)'}` }}>
                        {isUnique ? 'único' : `${g.owners.length} donos`}
                      </span>
                      <span style={{ fontSize:12, color:'var(--muted)', marginLeft:4 }}>{g.owners.join(', ')}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px', fontFamily:'JetBrains Mono,monospace', color:'var(--cyan)', verticalAlign:'middle' }}>
                    {g.totalHours.toFixed(1)}h
                    {g.price && <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{g.price}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:20, flexWrap:'wrap' }}>
          {Array.from({length:Math.min(pages,10)},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>{setPage(p);window.scrollTo(0,200);}} style={{ background:'var(--surface)', border:`1px solid ${p===page?'var(--blue)':'var(--border)'}`, borderRadius:6, padding:'7px 13px', color: p===page?'var(--blue)':'var(--muted)', fontFamily:'JetBrains Mono,monospace', fontSize:12, cursor:'pointer' }}>{p}</button>
          ))}
          {pages>10 && <span style={{ color:'var(--muted)', fontSize:12, padding:'0 8px', alignSelf:'center' }}>... {pages} páginas</span>}
        </div>
      )}
    </div>
  );
}
