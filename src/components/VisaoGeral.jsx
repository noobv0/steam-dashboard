// src/components/VisaoGeral.jsx
import { useState, useEffect, useRef } from 'react';

const COLORS = ['#4facfe','#f5a623','#9b59b6','#00c8a8','#ffffff','#e84393'];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value / 100);
}

function StatCard({ label, value }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 20px', display:'flex', flexDirection:'column', justifyContent:'space-between', height:88 }}>
      <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--muted)', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, background:'linear-gradient(90deg,var(--blue),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, overflow:'hidden', display:'flex', alignItems:'flex-end' }}>
        <span style={{ fontSize:'clamp(16px, 2.2vw, 28px)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{value}</span>
      </div>
    </div>
  );
}

function RankItem({ rank, name, value, max, label, avatar }) {
  const cls = rank===0?'#ffd60a':rank===1?'#94a3b8':rank===2?'#ff6b35':'var(--muted)';
  const pct = Math.round((value/max)*100);
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:20, fontWeight:700, color:cls, minWidth:28 }}>{rank+1}</div>
      {avatar && <img src={avatar} style={{ width:32, height:32, borderRadius:6, objectFit:'cover' }} />}
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{name}</div>
        <div style={{ height:4, background:'var(--bg)', borderRadius:4, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,var(--blue),var(--cyan))', transition:'width 1s ease' }} />
        </div>
      </div>
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color:'var(--cyan)', minWidth:70, textAlign:'right' }}>{label}</div>
    </div>
  );
}

// ── Gráfico de barras de horas por pessoa ─────────────────────────────────────
function HoursChart({ allData, allGames, players }) {
  const names = Object.keys(allData);
  const [animated, setAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const data = names.map((name, i) => {
    const hours = Math.round(allData[name].reduce((s,g)=>s+g.playtime_forever/60,0));
    const games = allData[name].length;
    return { name, hours, games, color: COLORS[i % COLORS.length], avatar: players[name]?.avatarmedium };
  });
  const maxH = Math.max(...data.map(d => d.hours));

  return (
    <div ref={ref} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:32 }}>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:24 }}>
        📊 Horas por Pessoa
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:180 }}>
        {data.map(d => {
          const pct = maxH > 0 ? (d.hours / maxH) * 100 : 0;
          return (
            <div key={d.name} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color: d.color }}>{d.hours.toLocaleString()}h</div>
              <div style={{ width:'100%', position:'relative', height:`${animated ? pct : 0}%`, minHeight: animated && pct > 0 ? 4 : 0, background:`linear-gradient(180deg,${d.color},${d.color}88)`, borderRadius:'6px 6px 0 0', transition:'height 1s cubic-bezier(.34,1.1,.64,1)', boxShadow:`0 0 12px ${d.color}44` }} />
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                {d.avatar
                  ? <img src={d.avatar} style={{ width:28, height:28, borderRadius:6, objectFit:'cover', border:`2px solid ${d.color}` }} />
                  : <div style={{ width:28, height:28, borderRadius:6, background:d.color+'33', border:`2px solid ${d.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, color:d.color }}>{d.name.slice(0,2).toUpperCase()}</div>
                }
                <div style={{ fontSize:11, color:'var(--muted)', fontWeight:500 }}>{d.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Comparador entre 2 pessoas ────────────────────────────────────────────────
function Comparador({ allData, allGames, players }) {
  const names = Object.keys(allData);
  const [a, setA] = useState(names[0] || '');
  const [b, setB] = useState(names[1] || '');

  const common = a && b && a !== b
    ? Object.values(allGames).filter(g => g.owners.includes(a) && g.owners.includes(b)).sort((x,y) => y.totalHours - x.totalHours)
    : [];

  const onlyA = a ? Object.values(allGames).filter(g => g.owners.includes(a) && !g.owners.includes(b)).length : 0;
  const onlyB = b ? Object.values(allGames).filter(g => g.owners.includes(b) && !g.owners.includes(a)).length : 0;

  const hoursA = a ? Math.round(allData[a]?.reduce((s,g)=>s+g.playtime_forever/60,0)||0) : 0;
  const hoursB = b ? Math.round(allData[b]?.reduce((s,g)=>s+g.playtime_forever/60,0)||0) : 0;

  const selStyle = (name) => ({
    flex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8,
    padding:'10px 14px', color:'var(--text)', fontFamily:'Rajdhani,sans-serif',
    fontSize:14, fontWeight:600, cursor:'pointer', outline:'none',
    appearance:'none', WebkitAppearance:'none',
  });

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:32 }}>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:20 }}>
        ⚔️ Comparador
      </div>

      {/* Selects */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20 }}>
        <select value={a} onChange={e=>setA(e.target.value)} style={selStyle(a)}>
          {names.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, color:'var(--muted)', fontWeight:700 }}>VS</div>
        <select value={b} onChange={e=>setB(e.target.value)} style={selStyle(b)}>
          {names.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {a && b && a !== b && (
        <>
          {/* Stats lado a lado */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, marginBottom:20 }}>
            {/* A */}
            <div style={{ background:'var(--bg2)', borderRadius:10, padding:16, textAlign:'center' }}>
              {players[a]?.avatarmedium && <img src={players[a].avatarmedium} style={{ width:48, height:48, borderRadius:8, objectFit:'cover', marginBottom:8 }} />}
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, color: COLORS[names.indexOf(a) % COLORS.length], marginBottom:12 }}>{a}</div>
              {[['Jogos', allData[a]?.length || 0],['Horas', `${hoursA.toLocaleString()}h`],['Exclusivos', onlyA]].map(([l,v])=>(
                <div key={l} style={{ marginBottom:8 }}>
                  <div style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', color:'var(--muted)' }}>{l}</div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:20, fontWeight:700, color:'var(--cyan)' }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Em comum */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:32, fontWeight:700, color:'var(--blue)' }}>{common.length}</div>
              <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center', lineHeight:1.4 }}>jogos<br/>em comum</div>
            </div>
            {/* B */}
            <div style={{ background:'var(--bg2)', borderRadius:10, padding:16, textAlign:'center' }}>
              {players[b]?.avatarmedium && <img src={players[b].avatarmedium} style={{ width:48, height:48, borderRadius:8, objectFit:'cover', marginBottom:8 }} />}
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, color: COLORS[names.indexOf(b) % COLORS.length], marginBottom:12 }}>{b}</div>
              {[['Jogos', allData[b]?.length || 0],['Horas', `${hoursB.toLocaleString()}h`],['Exclusivos', onlyB]].map(([l,v])=>(
                <div key={l} style={{ marginBottom:8 }}>
                  <div style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', color:'var(--muted)' }}>{l}</div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:20, fontWeight:700, color:'var(--cyan)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rivalidade: jogos em comum com diferença de horas */}
          {common.length > 0 && (
            <>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color:'var(--muted)', marginBottom:12 }}>
                🔥 Rivalidade — jogos em comum por horas
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {common.slice(0, 8).map(g => {
                  const hA = (allData[a]?.find(x=>x.appid===g.appid)?.playtime_forever||0)/60;
                  const hB = (allData[b]?.find(x=>x.appid===g.appid)?.playtime_forever||0)/60;
                  const total = hA + hB || 1;
                  const pctA = (hA / total) * 100;
                  const colorA = COLORS[names.indexOf(a) % COLORS.length];
                  const colorB = COLORS[names.indexOf(b) % COLORS.length];
                  const winner = hA > hB ? a : hB > hA ? b : null;
                  return (
                    <div key={g.appid} style={{ background:'var(--bg2)', borderRadius:8, padding:'10px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                        <span style={{ color: winner===a ? colorA : 'var(--muted)', fontWeight: winner===a?700:400 }}>{hA.toFixed(0)}h</span>
                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, textAlign:'center', fontSize:12, color:'var(--text)' }}>{g.name}</span>
                        <span style={{ color: winner===b ? colorB : 'var(--muted)', fontWeight: winner===b?700:400 }}>{hB.toFixed(0)}h</span>
                      </div>
                      <div style={{ height:6, borderRadius:4, overflow:'hidden', display:'flex' }}>
                        <div style={{ width:`${pctA}%`, background:colorA, transition:'width .8s ease' }} />
                        <div style={{ flex:1, background:colorB }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
      {a === b && <div style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:20 }}>Selecione duas pessoas diferentes.</div>}
    </div>
  );
}

// ── Hall da Fama ──────────────────────────────────────────────────────────────
function HallDaFama({ allData, allGames, players }) {
  const names = Object.keys(allData);

  const records = [
    {
      icon:'🎮', label:'Mais jogos',
      winner: [...names].sort((a,b)=>allData[b].length-allData[a].length)[0],
      value: n => `${allData[n].length} jogos`,
    },
    {
      icon:'⏱', label:'Mais horas',
      winner: [...names].sort((a,b)=>allData[b].reduce((s,g)=>s+g.playtime_forever/60,0)-allData[a].reduce((s,g)=>s+g.playtime_forever/60,0))[0],
      value: n => `${Math.round(allData[n].reduce((s,g)=>s+g.playtime_forever/60,0)).toLocaleString()}h`,
    },
    {
      icon:'💎', label:'Mais únicos',
      winner: [...names].sort((a,b)=>Object.values(allGames).filter(g=>g.owners.length===1&&g.owners[0]===b).length - Object.values(allGames).filter(g=>g.owners.length===1&&g.owners[0]===a).length)[0],
      value: n => `${Object.values(allGames).filter(g=>g.owners.length===1&&g.owners[0]===n).length} únicos`,
    },
    {
      icon:'📈', label:'Maior média/jogo',
      winner: [...names].sort((a,b)=>{
        const avg = n => allData[n].length ? allData[n].reduce((s,g)=>s+g.playtime_forever/60,0)/allData[n].length : 0;
        return avg(b)-avg(a);
      })[0],
      value: n => { const avg = allData[n].length ? allData[n].reduce((s,g)=>s+g.playtime_forever/60,0)/allData[n].length : 0; return `${avg.toFixed(1)}h/jogo`; },
    },
    {
      icon:'💰', label:'Maior biblioteca $',
      winner: [...names].sort((a,b)=>{
        const val = n => allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL||allGames[g.appid]?.priceUSD||0),0);
        return val(b)-val(a);
      })[0],
      value: n => { const v = allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL||allGames[g.appid]?.priceUSD||0),0); return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v/100); },
    },
    {
      icon:'🏆', label:'Jogo mais jogado do grupo',
      winner: null,
      special: () => {
        const top = Object.values(allGames).sort((a,b)=>b.totalHours-a.totalHours)[0];
        return top ? `${top.name} — ${top.totalHours.toFixed(0)}h totais` : '—';
      },
    },
  ];

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:32 }}>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:20 }}>
        🏅 Hall da Fama
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
        {records.map((r, i) => {
          const w = r.winner;
          const color = w ? COLORS[names.indexOf(w) % COLORS.length] : '#ffd60a';
          const p = w ? players[w] : null;
          return (
            <div key={i} style={{ background:'var(--bg2)', borderRadius:10, padding:16, border:`1px solid ${color}33`, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${color},transparent)` }} />
              <div style={{ fontSize:22, marginBottom:6 }}>{r.icon}</div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--muted)', marginBottom:8 }}>{r.label}</div>
              {r.special ? (
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:15, fontWeight:700, color }}>{r.special()}</div>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {p?.avatarmedium
                    ? <img src={p.avatarmedium} style={{ width:36, height:36, borderRadius:6, objectFit:'cover', border:`2px solid ${color}` }} />
                    : <div style={{ width:36, height:36, borderRadius:6, background:color+'22', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani,sans-serif', fontSize:14, fontWeight:700, color }}>{w?.slice(0,2).toUpperCase()}</div>
                  }
                  <div>
                    <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:16, fontWeight:700, color }}>{w}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{r.value(w)}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function VisaoGeral({ allData, allGames, players }) {
  const names = Object.keys(allData);

  const totalGamesUniq = Object.keys(allGames).length;
  const totalHours = Object.values(allGames).reduce((s,g)=>s+g.totalHours,0);
  const totalCommon = Object.values(allGames).filter(g=>g.owners.length===names.length).length;
  const totalValue = Object.values(allGames).reduce((s,g)=>s+(g.priceBRL||g.priceUSD||0),0);
  const mostGames = [...names].sort((a,b)=>allData[b].length-allData[a].length)[0];

  const byGames = [...names].sort((a,b)=>allData[b].length-allData[a].length);
  const byHours = [...names].sort((a,b)=>allData[b].reduce((s,g)=>s+g.playtime_forever/60,0)-allData[a].reduce((s,g)=>s+g.playtime_forever/60,0));
  const byValue = [...names].sort((a,b)=>{
    const v = n=>allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL||allGames[g.appid]?.priceUSD||0),0);
    return v(b)-v(a);
  });
  const maxG = allData[byGames[0]]?.length || 1;
  const maxH = allData[byHours[0]]?.reduce((s,g)=>s+g.playtime_forever/60,0) || 1;
  const maxV = Math.max(...byValue.map(n=>allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL||allGames[g.appid]?.priceUSD||0),0))) || 1;

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:32 }}>
        <StatCard label="Contas" value={names.length} />
        <StatCard label="Jogos Únicos" value={totalGamesUniq.toLocaleString()} />
        <StatCard label="Horas Totais" value={`${Math.round(totalHours).toLocaleString()}h`} />
        <StatCard label="Em Comum" value={totalCommon} />
        <StatCard label="Valor Total" value={formatCurrency(totalValue)} />
        <StatCard label="Mais Jogos" value={mostGames} />
      </div>

      {/* Account cards */}
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>Contas</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:40 }}>
        {names.map((name, i) => {
          const games = allData[name];
          const hours = Math.round(games.reduce((s,g)=>s+g.playtime_forever/60,0));
          const avg = games.length ? (hours/games.length).toFixed(1) : 0;
          const uniq = games.filter(g=>allGames[g.appid]?.owners.length===1).length;
          const accountValue = games.reduce((s,g)=>s+(allGames[g.appid]?.priceBRL||allGames[g.appid]?.priceUSD||0),0);
          const p = players[name];
          const color = COLORS[i % COLORS.length];
          return (
            <div key={name} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:20, position:'relative', overflow:'hidden', transition:'transform .2s, box-shadow .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 32px ${color}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},var(--cyan))` }} />
              <div style={{ width:56, height:56, borderRadius:10, overflow:'hidden', marginBottom:12, border:`2px solid ${color}33`, background:'var(--surface2)' }}>
                {p?.avatarfull
                  ? <img src={p.avatarfull} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani,sans-serif', fontSize:22, fontWeight:700, color }}>{name.slice(0,2).toUpperCase()}</div>
                }
              </div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:20, fontWeight:700, marginBottom:4 }}>{name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, minHeight:16 }}>
                {p?.personaname && p.personaname !== name ? p.personaname : ''}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['Jogos', games.length.toLocaleString()],['Horas', `${hours.toLocaleString()}h`],['Valor', formatCurrency(accountValue)],['Únicos', uniq]].map(([l,v])=>(
                  <div key={l} style={{ background:'var(--bg2)', borderRadius:6, padding:'10px 12px' }}>
                    <div style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', color:'var(--muted)', marginBottom:4 }}>{l}</div>
                    <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, color:'var(--cyan)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      <HoursChart allData={allData} allGames={allGames} players={players} />

      {/* Hall da Fama */}
      <HallDaFama allData={allData} allGames={allGames} players={players} />

      {/* Comparador */}
      <Comparador allData={allData} allGames={allGames} players={players} />

      {/* Rankings */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
        <div>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>🏆 Ranking Jogos</div>
          {byGames.map((n,i)=><RankItem key={n} rank={i} name={n} value={allData[n].length} max={maxG} label={allData[n].length.toLocaleString()} avatar={players[n]?.avatarmedium} />)}
        </div>
        <div>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>⏱ Ranking Horas</div>
          {byHours.map((n,i)=>{ const h=Math.round(allData[n].reduce((s,g)=>s+g.playtime_forever/60,0)); return <RankItem key={n} rank={i} name={n} value={h} max={maxH} label={`${h.toLocaleString()}h`} avatar={players[n]?.avatarmedium} />; })}
        </div>
        <div>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>💰 Ranking Valor</div>
          {byValue.map((n,i)=>{ const v=allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL||allGames[g.appid]?.priceUSD||0),0); return <RankItem key={n} rank={i} name={n} value={v} max={maxV} label={formatCurrency(v)} avatar={players[n]?.avatarmedium} />; })}
        </div>
      </div>
    </div>
  );
}
