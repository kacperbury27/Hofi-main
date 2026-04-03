export const fmtDate = (d) => {
  if (!d) return "";
  const parts = d.slice(0,10).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
  return d;
};

export const fmt = (v, cur="PLN") =>
  `${Math.abs(v).toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} ${cur}`;

export const fmtShort = (v) =>
  Math.abs(v) >= 1000
    ? `${(Math.abs(v)/1000).toFixed(1)}k`
    : Math.abs(v).toFixed(0);

export const getMonthKey = (d) => d.slice(0,7);
