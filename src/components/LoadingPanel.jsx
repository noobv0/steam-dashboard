// src/components/LoadingPanel.jsx

const TIPS = [
  '💡 Jogos com mais de 1000h são considerados "eternos" — quem tem mais?',
  '🎮 A Steam tem mais de 50.000 jogos catalogados.',
  '⏱ A média de horas jogadas por jogo no Steam é menos de 5h.',
  '🏆 Alguns jogos têm mais de 1.000 conquistas desbloqueáveis.',
  '🌍 O Brasil é um dos 5 maiores mercados de jogadores no Steam.',
  '👾 Albion Online: mais de 1000h no grupo — isso é dedicação!',
];

export default function LoadingPanel({ msg, step, total }) {
  const pct = total > 0 ? Math.round((step / total) * 100) : 10;
  const tip = TIPS[step % TIPS.length];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:24, padding:40, position:'relative', zIndex:1 }}>
      {/* Spinner */}
      <div style={{ width:64, height:64, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--blue)', animation:'spin 1s linear infinite' }} />

      {/* Mensagem atual */}
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:14, color:'var(--text)', textAlign:'center' }}>
        {msg || 'Iniciando...'}
      </div>

      {/* Barra de progresso */}
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:12, color:'var(--muted)' }}>
            {step} de {total} contas
          </span>
          <span style={{ fontSize:12, color:'var(--blue)', fontFamily:'JetBrains Mono,monospace' }}>
            {pct}%
          </span>
        </div>
        <div style={{ height:6, background:'var(--border)', borderRadius:6, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,var(--blue),var(--cyan))', borderRadius:6, transition:'width .4s ease' }} />
        </div>
      </div>

      {/* Dica */}
      <div style={{ maxWidth:420, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px', fontSize:13, color:'var(--muted)', textAlign:'center', lineHeight:1.6 }}>
        {tip}
      </div>
    </div>
  );
}
