import { DARK } from '../../constants/theme';

const C = DARK;

export const Card = ({ children, style={} }) => (
  <div style={{
    background:C.s1, border:`1px solid ${C.border}`, borderRadius:14,
    padding:"12px 16px", ...style,
  }}>{children}</div>
);

export const Label = ({ children }) => (
  <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>
    {children}
  </div>
);

export const Chip = ({ label, active, color=C.accent, onClick }) => (
  <button onClick={onClick} style={{
    padding:"5px 12px", borderRadius:20,
    border:`1px solid ${active ? color : C.border}`,
    background: active ? `${color}20` : "transparent",
    color: active ? color : C.textSub,
    fontSize:12, fontFamily:"DM Mono,monospace",
    cursor:"pointer", transition:"all .15s",
  }}>{label}</button>
);
