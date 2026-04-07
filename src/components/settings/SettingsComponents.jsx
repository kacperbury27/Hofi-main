import { DARK, LIGHT } from '../../constants/theme';

export const SettingsSection = ({ label, children, theme=DARK }) => {
  const T = theme;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}><div style={{ width:3, height:10, borderRadius:2, background:T.accentGrad }} /><div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div></div>
      <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        {children}
      </div>
    </div>
  );
};

export const SRow = ({ icon, label, sub, right, danger, chevron, onClick, last, theme=DARK }) => {
  const T = theme;
  return (
    <div onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
      cursor: onClick ? "pointer" : "default",
      background: "transparent",
    }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, color: danger ? T.red : T.text, fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
      {chevron && <span style={{ color:T.secondary, fontSize:18, marginLeft:4 }}>›</span>}
    </div>
  );
};

export const SSwitch = ({ on, onToggle, theme=DARK }) => {
  const T = theme;
  return (
    <div onClick={onToggle} style={{ width:46, height:26, borderRadius:13, flexShrink:0, background: on ? T.accent : T.s3, border:`1px solid ${on ? T.accent : T.border}`, position:"relative", transition:"background .2s", cursor:"pointer" }}>
      <div style={{ position:"absolute", top:3, left: on ? 22 : 3, width:18, height:18, borderRadius:9, background: on ? "#fff" : T.secondary, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </div>
  );
};

export const SSelect = ({ options, value, onChange, theme=DARK }) => {
  const T = theme;
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      onClick={e=>e.stopPropagation()}
      style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:"6px 10px", color:T.accent, fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:600, outline:"none", cursor:"pointer", colorScheme: T === LIGHT ? "light" : "dark" }}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
};
