import { useState } from 'react';
import { DARK } from '../../constants/theme';
import { CATS, CAT_COLORS, CURRENCIES } from '../../constants/categories';

const C = DARK;

export function TxModal({ tx, onSave, onClose }) {
  const [form, setForm] = useState(tx || {
    desc:"", amount:"", cat:"Jedzenie", who:"Kacper",
    date:new Date().toISOString().slice(0,10),
    currency:"PLN", type:"expense",
  });
  const [errors, setErrors] = useState({});

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:null})); };

  const validate = () => {
    const e = {};
    if (!form.desc.trim()) e.desc = "Wpisz opis";
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = "Podaj kwotę > 0";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const sign = form.type === "expense" ? -1 : 1;
    onSave({ ...form, id: form.id || Date.now(), amount: sign * Math.abs(parseFloat(form.amount)) });
    onClose();
  };

  const inp = (label, key, placeholder, type="text") => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color: errors[key] ? C.red : C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>
        {errors[key] || label}
      </div>
      <input
        value={form[key]}
        type={type}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", background:C.s2, border:`1px solid ${errors[key] ? C.red : C.border}`,
          borderRadius:10, padding:"10px 14px", color:C.text,
          fontFamily:"DM Mono,monospace", fontSize:14, outline:"none",
          boxSizing:"border-box",
        }}
      />
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(6,6,15,.85)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:999,
    }} onClick={onClose}>
      <div style={{
        background:C.s1, border:`1px solid ${C.border}`, borderRadius:20,
        padding:24, width:420, maxWidth:"92vw",
      }} onClick={e=>e.stopPropagation()}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontSize:17, fontWeight:700 }}>{form.id ? "Edytuj" : "Nowa transakcja"}</div>
          <button onClick={onClose} style={{ background:C.s2, border:`1px solid ${C.border}`, color:C.textSub, width:28, height:28, borderRadius:14, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ display:"flex", background:C.s2, borderRadius:11, padding:4, marginBottom:16, border:`1px solid ${C.border}`, gap:4 }}>
          {[{k:"expense",l:"— Wydatek",c:C.red},{k:"income",l:"+ Przychód",c:C.accent}].map(t=>(
            <button key={t.k} onClick={()=>set("type",t.k)} style={{
              flex:1, padding:"9px", borderRadius:8, border:"none",
              background: form.type===t.k ? `${t.c}22` : "transparent",
              color: form.type===t.k ? t.c : C.muted,
              fontSize:13, fontWeight:600, fontFamily:"Outfit,sans-serif", cursor:"pointer",
            }}>{t.l}</button>
          ))}
        </div>

        {inp("Opis","desc","np. Biedronka")}

        <div style={{ display:"flex", gap:10, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            {inp("Kwota","amount","0.00")}
          </div>
          <div style={{ width:90 }}>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>Waluta</div>
            <select value={form.currency} onChange={e=>set("currency",e.target.value)} style={{ width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"DM Mono,monospace", fontSize:14, outline:"none" }}>
              {CURRENCIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {inp("Data","date",null,"date")}

        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Kto wydaje</div>
          <div style={{ display:"flex", gap:8 }}>
            {["Kacper","Anna"].map(w=>(
              <button key={w} onClick={()=>set("who",w)} style={{
                flex:1, padding:"9px", borderRadius:10,
                border:`1px solid ${form.who===w ? (w==="Kacper"?C.blue:C.purple) : C.border}`,
                background: form.who===w ? (w==="Kacper"?`${C.blue}20`:`${C.purple}20`) : "transparent",
                color: form.who===w ? (w==="Kacper"?C.blue:C.purple) : C.textSub,
                cursor:"pointer", fontFamily:"DM Mono,monospace", fontSize:13,
              }}>{w}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Kategoria</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {CATS.map(c=>(
              <button key={c} onClick={()=>set("cat",c)} style={{
                padding:"6px 13px", borderRadius:20,
                border:`1px solid ${form.cat===c ? (CAT_COLORS[c]||C.accent) : C.border}`,
                background: form.cat===c ? `${CAT_COLORS[c]||C.accent}20` : "transparent",
                color: form.cat===c ? (CAT_COLORS[c]||C.accent) : C.textSub,
                fontSize:11, fontFamily:"DM Mono,monospace", cursor:"pointer",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} style={{
          width:"100%", padding:"14px", background:C.accent, borderRadius:12,
          border:"none", color:"#06060f", fontSize:14, fontWeight:700,
          fontFamily:"Outfit,sans-serif", cursor:"pointer",
        }}>
          {form.id ? "Zapisz" : "Dodaj"}
        </button>
      </div>
    </div>
  );
}

export default TxModal;
