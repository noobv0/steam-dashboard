// src/components/LoadingPanel.jsx
export default function LoadingPanel({ step, total, label }) {
  const pct = total > 0 ? Math.min(100, Math.round((step / total) * 100)) : 5;
  const accounts = Array.from({ length: total - 2 }, (_, i) => i); // exclude avatars+categories steps

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:32, padding:40, position:'relative', zIndex:1 }}>

      {/* Logo animado */}
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:32, fontWeight:700, letterSpacing:4, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'pulse 2s infinite' }}>
        STEAM FAMILY HUB
      </div>

      {/* Círculo de progresso */}
      <div style={{ position:'relative', width:140, height:140 }}>
        <svg width="140" height="140" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle cx="70" cy="70" r="60" fill="none" stroke="url(#grad)" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct/100)}`}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset .5s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--blue)" />
              <stop offset="100%" stopColor="var(--cyan)" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:36, fontWeight:700, color:'var(--blue)' }}>{pct}%</span>
        </div>
      </div>

      {/* Conta atual */}
      {label && label !== 'avatares' && label !== 'categorias' && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 20px' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--blue)', boxShadow:'0 0 8px var(--blue)', animation:'pulse 1s infinite' }} />
          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:14, color:'var(--text)' }}>{label}</span>
        </div>
      )}
      {(label === 'avatares' || label === 'categorias') && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 20px' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 8px var(--cyan)', animation:'pulse 1s infinite' }} />
          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:14, color:'var(--muted)' }}>
            {label === 'avatares' ? 'Carregando perfis...' : 'Buscando categorias...'}
          </span>
        </div>
      )}

      {/* Barra linear */}
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ height:4, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'var(--grad)', borderRadius:4, transition:'width .5s ease' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
          <span style={{ fontSize:11, color:'var(--muted)', fontFamily:'JetBrains Mono,monospace' }}>
            {step} / {total} etapas
          </span>
          <span style={{ fontSize:11, color:'var(--muted)', fontFamily:'JetBrains Mono,monospace' }}>
            {pct === 100 ? 'Finalizando...' : 'Carregando...'}
          </span>
        </div>
      </div>
    </div>
  );
}
