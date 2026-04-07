import { useState, useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import TxModal from './components/transactions/TxModal';
import { useTransactionState } from './hooks/useTransactionState';
import { useGoalsState } from './hooks/useGoalsState';
import { DARK, LIGHT } from './constants/theme';
import { CURRENT_MONTH_LABEL } from './utils/period';

export default function App() {
  const [view, setView] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const { txs, editingTx, setEditingTx, addTransaction, deleteTransaction } = useTransactionState();
  const { goals, saveGoal, deleteGoal } = useGoalsState();
  const [modal, setModal] = useState(null);

  const C = darkMode ? DARK : LIGHT;

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap";
    link.rel="stylesheet";
    document.head.appendChild(link);
    return ()=>{ if(document.head.contains(link)) document.head.removeChild(link); };
  },[]);

  const handleSave = (txOrArray) => {
    const items = Array.isArray(txOrArray) ? txOrArray : [txOrArray];
    items.forEach(tx => addTransaction(tx));
    setModal(null);
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"Outfit,sans-serif", transition:"background .3s, color .3s" }}>
      <header style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:`${C.bg}ee`, backdropFilter:"blur(12px)", zIndex:100 }}>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:C.accent, letterSpacing:"0.22em", textTransform:"uppercase", fontWeight:700 }}>🏠 HouseFinance</div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ display:"flex", gap:6, background:C.s1, borderRadius:10, padding:4, border:`1px solid ${C.border}` }}>
            {[{k:"dashboard",l:"🖥  Dashboard"},{k:"mobile",l:"📱  Mobile"}].map(v=>(
              <button key={v.k} onClick={()=>setView(v.k)} style={{ padding:"8px 16px", borderRadius:7, border:"none", background:view===v.k?C.accent:"transparent", color:view===v.k?"#06060f":C.muted, fontSize:13, fontFamily:"Outfit,sans-serif", fontWeight:700, cursor:"pointer", transition:"all .15s" }}>{v.l}</button>
            ))}
          </div>

          <button onClick={() => setDarkMode(!darkMode)} style={{
            width:36, height:36, borderRadius:10, border:`1px solid ${C.border}`,
            background:C.s1, color:C.text, fontSize:18, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all .2s", hover:{background:C.s2}
          }} title={darkMode ? "Jasny motyw" : "Ciemny motyw"}>
            {darkMode ? "☀" : "🌙"}
          </button>
        </div>

        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:C.textSub }}>{CURRENT_MONTH_LABEL}</div>
      </header>

      {view==="dashboard"
        ? <Dashboard txs={txs} onEdit={tx=>setModal(tx)} onDelete={deleteTransaction} onAdd={()=>setModal("add")} theme={darkMode ? DARK : LIGHT} />
        : <div style={{ padding: "40px 20px", textAlign: "center", color: C.textSub }}>Mobile App - TODO</div>
      }

      {modal && view==="dashboard" && (
        <TxModal
          tx={modal==="add" ? null : modal}
          onSave={handleSave}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
