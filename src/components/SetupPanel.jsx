// src/components/SetupPanel.jsx
import { useState } from 'react';

const DEFAULT_ACCOUNTS = [
  { name: 'Lírio',  id: '76561198158302059' },
  { name: 'Kiri',   id: '76561199011715965' },
  { name: 'Dudu',   id: '76561198833523657' },
  { name: 'Bambo',  id: '76561199148095723' },
  { name: 'Nino',   id: '76561198394798327' },
  { name: 'Carrot', id: '76561199001083134' },
];

const s = {
  wrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' },
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:40, width:'100%', maxWidth:600, boxShadow:'0 0 60px rgba(79,172,254,0.08)', position:'relative', zIndex:1 },
  title: { fontFamily:'Rajdhani,sans-serif', fontSize:28, fontWeight:700, letterSpacing:2, marginBottom:6 },
  sub: { color:'var(--muted)', fontSize:14, marginBottom:32 },
  label: { display:'block', fontSize:12, fontWeight:500, letterSpacing:1, color:'var(--blue)', textTransform:'uppercase', marginBottom:8 },
  input: { width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', color:'var(--text)', fontFamily:'JetBrains Mono,monospace', fontSize:13, outline:'none', marginBottom:20 },
  row: { display:'flex', gap:10, alignItems:'center', marginBottom:10 },
  rowInput: { flex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', color:'var(--text)', fontFamily:'JetBrains Mono,monospace', fontSize:13, outline:'none' },
  rowInputName: { maxWidth:140, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', color:'var(--text)', fontFamily:'JetBrains Mono,monospace', fontSize:13, outline:'none' },
  rmBtn: { background:'none', border:'1px solid var(--border)', borderRadius:6, color:'var(--muted)', cursor:'pointer', padding:'10px 12px', fontSize:14, flexShrink:0 },
  addBtn: { background:'none', border:'1px dashed var(--border)', borderRadius:8, color:'var(--muted)', cursor:'pointer', padding:10, fontSize:13, width:'100%', marginBottom:28, marginTop:4 },
  loadBtn: { background:'linear-gradient(135deg,var(--blue),var(--cyan))', border:'none', borderRadius:8, color:'#000', fontFamily:'Rajdhani,sans-serif', fontSize:16, fontWeight:700, letterSpacing:2, padding:'13px 32px', cursor:'pointer', width:'100%', textTransform:'uppercase' },
  error: { background:'rgba(255,45,120,0.08)', border:'1px solid rgba(255,45,120,0.3)', borderRadius:8, padding:'14px 18px', color:'var(--pink)', fontSize:13, marginBottom:16 },
  note: { marginTop:16, fontSize:12, color:'var(--muted)', textAlign:'center', lineHeight:1.6 },
};

export default function SetupPanel({ onLoad }) {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [error, setError] = useState('');

  const update = (i, field, val) => setAccounts(prev => prev.map((a,j) => j===i ? {...a,[field]:val} : a));
  const addRow = () => setAccounts(prev => [...prev, { name:'', id:'' }]);
  const removeRow = i => setAccounts(prev => prev.length > 1 ? prev.filter((_,j)=>j!==i) : prev);

  const handleLoad = () => {
    const valid = accounts.filter(a => a.name.trim() && a.id.trim());
    if (!valid.length) { setError('Adicione pelo menos uma conta com nome e ID.'); return; }
    setError('');
    onLoad(valid);
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>⚙ CONFIGURAÇÃO</div>
        <div style={s.sub}>Insira os perfis Steam (URL do perfil, vanity name ou SteamID64).</div>

        {error && <div style={s.error}>{error}</div>}

        <label style={s.label}>Contas</label>
        {accounts.map((acc, i) => (
          <div key={i} style={s.row}>
            <input style={s.rowInputName} placeholder="Apelido" value={acc.name} onChange={e=>update(i,'name',e.target.value)} />
            <input style={s.rowInput} placeholder="URL ou SteamID64" value={acc.id} onChange={e=>update(i,'id',e.target.value)} />
            <button style={s.rmBtn} onClick={()=>removeRow(i)}>✕</button>
          </div>
        ))}
        <button style={s.addBtn} onClick={addRow}>+ Adicionar conta</button>

        <button style={s.loadBtn} onClick={handleLoad}>CARREGAR DADOS</button>
      </div>
    </div>
  );
}
