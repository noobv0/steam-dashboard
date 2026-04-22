// src/components/VisaoGeral.jsx
const COLORS = ['#4facfe','#00c8a8','#39ff14','#ffd60a','#ff6b35','#ff2d78'];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
}

function StatCard({ label, value, small }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 20px', transition:'.2s' }}>
      <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--muted)', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize: small ? 20 : 28, fontWeight:700, background:'linear-gradient(90deg,var(--blue),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        {value}
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

export default function VisaoGeral({ allData, allGames, players }) {
  const names = Object.keys(allData);

  const totalGamesUniq = Object.keys(allGames).length;
  const totalHours = Object.values(allGames).reduce((s,g)=>s+g.totalHours,0);
  const totalCommon = Object.values(allGames).filter(g=>g.owners.length===names.length).length;
  const totalValue = Object.values(allGames).reduce((s,g)=>s+(g.priceBRL || g.priceUSD || 0),0);

  const mostGames = [...names].sort((a,b)=>allData[b].length-allData[a].length)[0];
  const mostHours = [...names].sort((a,b)=>{
    return allData[b].reduce((s,g)=>s+g.playtime_forever/60,0) - allData[a].reduce((s,g)=>s+g.playtime_forever/60,0);
  })[0];

  const byGames = [...names].sort((a,b)=>allData[b].length-allData[a].length);
  const byHours = [...names].sort((a,b)=>{
    return allData[b].reduce((s,g)=>s+g.playtime_forever/60,0) - allData[a].reduce((s,g)=>s+g.playtime_forever/60,0);
  });
  const byValue = [...names].sort((a,b)=>{
    const aVal = allData[a].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL || allGames[g.appid]?.priceUSD || 0),0);
    const bVal = allData[b].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL || allGames[g.appid]?.priceUSD || 0),0);
    return bVal - aVal;
  });

  const maxG = allData[byGames[0]]?.length || 1;
  const maxH = allData[byHours[0]]?.reduce((s,g)=>s+g.playtime_forever/60,0) || 1;
  const maxV = Math.max(...byValue.map(n=>allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL || allGames[g.appid]?.priceUSD || 0),0))) || 1;

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:32 }}>
        <StatCard label="Contas" value={names.length} />
        <StatCard label="Jogos Únicos" value={totalGamesUniq.toLocaleString()} />
        <StatCard label="Horas Totais" value={`${Math.round(totalHours).toLocaleString()}h`} />
        <StatCard label="Em Comum" value={totalCommon} />
        <StatCard label="Valor Total" value={formatCurrency(totalValue)} small />
        <StatCard label="Mais Jogos" value={mostGames} small />
      </div>

      {/* Account cards */}
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>Contas</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:40 }}>
        {names.map((name, i) => {
          const games = allData[name];
          const hours = Math.round(games.reduce((s,g)=>s+g.playtime_forever/60,0));
          const avg = games.length ? (hours/games.length).toFixed(1) : 0;
          const uniq = games.filter(g=>allGames[g.appid]?.owners.length===1).length;
          const accountValue = games.reduce((s,g)=>s+(allGames[g.appid]?.priceBRL || allGames[g.appid]?.priceUSD || 0),0);
          const p = players[name];
          const color = COLORS[i % COLORS.length];
          const initials = name.slice(0,2).toUpperCase();

          return (
            <div key={name} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:20, position:'relative', overflow:'hidden', transition:'.2s' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},var(--cyan))` }} />
              {/* Avatar */}
              <div style={{ width:56, height:56, borderRadius:10, overflow:'hidden', marginBottom:12, border:`2px solid ${color}33`, background:'var(--surface2)' }}>
                {p?.avatarfull
                  ? <img src={p.avatarfull} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani,sans-serif', fontSize:22, fontWeight:700, color }}>{initials}</div>
                }
              </div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:20, fontWeight:700, marginBottom:4 }}>{name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, minHeight:16 }}>
                {p?.personaname && p.personaname !== name ? p.personaname : ''}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
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

      {/* Rankings */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
        <div>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>🏆 Ranking Jogos</div>
          {byGames.map((n,i)=>(
            <RankItem key={n} rank={i} name={n} value={allData[n].length} max={maxG} label={allData[n].length.toLocaleString()} avatar={players[n]?.avatarmedium} />
          ))}
        </div>
        <div>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>⏱ Ranking Horas</div>
          {byHours.map((n,i)=>{
            const h = Math.round(allData[n].reduce((s,g)=>s+g.playtime_forever/60,0));
            return <RankItem key={n} rank={i} name={n} value={h} max={maxH} label={`${h.toLocaleString()}h`} avatar={players[n]?.avatarmedium} />;
          })}
        </div>
        <div>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--blue)', marginBottom:16 }}>💰 Ranking Valor</div>
          {byValue.map((n,i)=>{
            const v = allData[n].reduce((s,g)=>s+(allGames[g.appid]?.priceBRL || allGames[g.appid]?.priceUSD || 0),0);
            return <RankItem key={n} rank={i} name={n} value={v} max={maxV} label={formatCurrency(v)} avatar={players[n]?.avatarmedium} />;
          })}
        </div>
      </div>
    </div>
  );
}
