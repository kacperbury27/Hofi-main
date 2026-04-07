import { useState } from 'react';
import { DARK } from '../../constants/theme';
import { periodLabel } from '../../utils/period';
import DateRangePicker from './DateRangePicker';

const C = DARK;

export function PeriodSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const isCustom = typeof value === "object";
  const active = isCustom || value !== "this_month";
  return (
    <>
      <button
        onClick={()=>setOpen(true)}
        title={periodLabel(value)}
        style={{
          width:28, height:28, borderRadius:8, cursor:"pointer",
          border:`1px solid ${active ? C.accent : C.border}`,
          background: active ? `${C.accent}18` : C.s2,
          color: active ? C.accent : C.textSub,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, transition:"all .12s",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16l-6 8v7l-4-2v-5L4 4z"/>
        </svg>
      </button>
      {open && <DateRangePicker value={value} onChange={onChange} onClose={()=>setOpen(false)} />}
    </>
  );
}

export default PeriodSelector;
