import { DARK, LIGHT } from '../../constants/theme';

const Snackbar = ({ msg, onUndo, onClose, theme=DARK }) => {
  const Ts = theme;
  return (
    <div style={{
      position:"absolute", bottom:84, left:14, right:14, zIndex:500,
      background: Ts === LIGHT ? "#fff" : "#1e1e40",
      border:`1px solid ${Ts.border}`, borderRadius:14,
      padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
      boxShadow: Ts === LIGHT ? "0 8px 32px rgba(0,0,0,.15)" : "0 8px 32px rgba(0,0,0,.6)",
      animation:"slideUp .2s ease-out",
    }}>
      <span style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:Ts.text }}>{msg}</span>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <button onClick={onUndo} style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:Ts.accent, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Cofnij</button>
        <button onClick={onClose} style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:Ts.textSub, background:"none", border:"none", cursor:"pointer" }}>✕</button>
      </div>
    </div>
  );
};

export default Snackbar;
