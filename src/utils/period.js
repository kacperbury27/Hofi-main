import { fmtDate } from './formatters';
import { MONTHS } from '../constants/categories';

export const TODAY = new Date().toISOString().slice(0,10);

export const CURRENT_MONTH_LABEL = (() => {
  const d = new Date();
  const months = ["stycze\u0144","luty","marzec","kwiecie\u0144","maj","czerwiec","lipiec","sierpie\u0144","wrzesie\u0144","pa\u017adziernik","listopad","grudzie\u0144"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
})();

export const PRESETS = [
  { key:"this_month",  label:"Ten miesi\u0105c" },
  { key:"last_month",  label:"Ostatni miesi\u0105c" },
  { key:"last_3",      label:"Ostatnie 3 miesi\u0105ce" },
  { key:"this_year",   label:"Ten rok" },
  { key:"last_year",   label:"Ostatni rok" },
];

export function getRange(period) {
  if (typeof period === "object") return [period.from, period.to];
  const d = new Date(TODAY);
  const y = d.getFullYear(), m = d.getMonth();
  switch(period) {
    case "this_month":
      return [`${y}-${String(m+1).padStart(2,"0")}-01`, TODAY];
    case "last_month": {
      const lm = m === 0 ? 12 : m, ly = m === 0 ? y-1 : y;
      const last = new Date(ly, lm, 0).getDate();
      return [`${ly}-${String(lm).padStart(2,"0")}-01`, `${ly}-${String(lm).padStart(2,"0")}-${last}`];
    }
    case "last_3": {
      const from = new Date(d); from.setMonth(from.getMonth()-3);
      return [from.toISOString().slice(0,10), TODAY];
    }
    case "this_year":  return [`${y}-01-01`, TODAY];
    case "last_year":  return [`${y-1}-01-01`, `${y-1}-12-31`];
    default:           return [`${y}-${String(m+1).padStart(2,"0")}-01`, TODAY];
  }
}

export function filterByRange(txs, period) {
  const [from, to] = getRange(period);
  return txs.filter(t => t.date >= from && t.date <= to);
}

export function periodLabel(period) {
  if (typeof period === "object") {
    return `${fmtDate(period.from)} \u2013 ${fmtDate(period.to)}`;
  }
  return PRESETS.find(p=>p.key===period)?.label ?? period;
}
