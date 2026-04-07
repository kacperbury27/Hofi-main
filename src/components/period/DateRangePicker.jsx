import { useState } from 'react';
import { DARK } from '../../constants/theme';
import { fmtDate } from '../../utils/formatters';
import { TODAY, PRESETS, getRange } from '../../utils/period';

const C = DARK;

export function DateRangePicker({ value, onChange, onClose, inline=false }) {
  const isCustom = typeof value === "object";
  const [customFrom, setCustomFrom] = useState(isCustom ? value.from : "");
  const [customTo,   setCustomTo]   = useState(isCustom ? value.to   : "");
  const [tab, setTab] = useState(isCustom ? "custom" : "preset");
  const [customErr, setCustomErr] = useState("");

  const applyCustom = () => {
    if (!customFrom || !customTo) { setCustomErr("Wybierz obie daty"); return; }
    if (customFrom > customTo)    { setCustomErr("Data od > do"); return; }
    onChange({ from: customFrom, to: customTo });
    onClose();
  };

  const content = (
    <div style={{ width: inline ? "100%" : 300 }}>
      <div style={{ display:"flex", background:C.s2, borderRadius:10, padding:3, marginBottom:16, border:`1px solid ${C.border}`, gap:3 }}>
        {[{k:"preset",l:"Predefiniowane"},{k:"custom",l:"Własny zakres"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{
            flex:1, padding:"7px", borderRadius:8, border:"none",
            background: tab===t.k ? C.s3 : "transparent",
            color: tab===t.k ? C.text : C.muted,
            fontSize:11, fontFamily:"DM Mono,monospace",
            cursor:"pointer", transition:"all .12s",
          }}>{t.l}</button>
        ))}
      </div>

      {tab === "preset" ? (
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {PRESETS.map(p => {
            const active = value === p.key;
            const [from, to] = getRange(p.key);
            return (
              <button key={p.key} onClick={()=>{ onChange(p.key); onClose(); }} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 14px", borderRadius:10, border:`1px solid ${active ? C.accent : C.border}`,
                background: active ? `${C.accent}12` : C.s2,
                cursor:"pointer", transition:"all .12s",
              }}>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:12, color: active ? C.accent : C.text, fontWeight: active ? 600 : 400 }}>
                  {p.label}
                </span>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted }}>
                  {fmtDate(from)} – {fmtDate(to)}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
            {[{label:"Od", val:customFrom, set:setCustomFrom},{label:"Do", val:customTo, set:setCustomTo}].map(f=>(
              <div key={f.label}>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>{f.label}</div>
                <input type="date" value={f.val} max={TODAY}
                  onChange={e=>{ f.set(e.target.value); setCustomErr(""); }}
                  style={{ width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 13px", color:C.text, fontFamily:"DM Mono,monospace", fontSize:13, outline:"none", colorScheme:"dark", boxSizing:"border-box" }}
                />
              </div>
            ))}
          </div>
          {customErr && <div style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:C.red, marginBottom:10 }}>{customErr}</div>}
          <button onClick={applyCustom} style={{ width:"100%", padding:"11px", background:C.accent, borderRadius:10, border:"none", color:"#06060f", fontSize:13, fontWeight:700, fontFamily:"Outfit,sans-serif", cursor:"pointer" }}>
            Zastosuj
          </button>
        </div>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,6,15,.7)", backdropFilter:"blur(6px)" }} />
      <div style={{ position:"relative", background:C.s1, border:`1px solid ${C.border}`, borderRadius:18, padding:20, width:340, maxWidth:"92vw", boxShadow:"0 30px 80px rgba(0,0,0,.8)" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700 }}>Wybierz zakres</div>
          <button onClick={onClose} style={{ background:C.s2, border:`1px solid ${C.border}`, color:C.textSub, width:26, height:26, borderRadius:13, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        {content}
      </div>
    </div>
  );
}

export default DateRangePicker;
