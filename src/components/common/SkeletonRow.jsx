import { DARK } from '../../constants/theme';

const C = DARK;

const SkeletonRow = () => (
  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", background:C.s1, borderRadius:13, border:`1px solid ${C.border}`, marginBottom:7 }}>
    <div style={{ width:30, height:30, borderRadius:10, background:C.s2, animation:"pulse 1.4s ease-in-out infinite" }} />
    <div style={{ flex:1 }}>
      <div style={{ height:10, width:"55%", background:C.s2, borderRadius:5, marginBottom:6, animation:"pulse 1.4s ease-in-out infinite" }} />
      <div style={{ height:8, width:"35%", background:C.s2, borderRadius:5, animation:"pulse 1.4s ease-in-out .2s infinite" }} />
    </div>
    <div style={{ height:10, width:60, background:C.s2, borderRadius:5, animation:"pulse 1.4s ease-in-out .1s infinite" }} />
  </div>
);

export default SkeletonRow;
