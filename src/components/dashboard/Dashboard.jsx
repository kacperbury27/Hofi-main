import { useMemo, useState, useCallback } from 'react';
import { Card, Label } from '../common/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { filterByRange, getRange, periodLabel } from '../../utils/period';
import { getPLNAmount } from '../../utils/currency';
import { fmt, fmtShort, getMonthKey, fmtDate } from '../../utils/formatters';
import { MONTHS, CAT_COLORS, CAT_ICONS } from '../../constants/categories';
import { makeTT, DARK, LIGHT } from '../../constants/theme';
import PeriodSelector from '../period/PeriodSelector';
import Avatar from '../common/Avatar';

const C = DARK;
const tt = makeTT(C);

export function Dashboard({ txs, onEdit, onDelete, onAdd, theme = DARK }) {
  const [period, setPeriod] = useState("this_month");
  const [expandedTx, setExpandedTx] = useState(null);

  const T = theme === "light" ? LIGHT : DARK;
  const filtered = useMemo(() => filterByRange(txs, period), [txs, period]);

  const income = filtered.filter(t=>t.amount>0).reduce((a,t)=>a+getPLNAmount(t),0);
  const expense = filtered.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
  const balance = income - expense;

  const trendData = useMemo(() => {
    const map = {};
    txs.forEach(t => {
      const k = getMonthKey(t.date);
      if (!map[k]) map[k] = { m: k, inn:0, out:0 };
      const v = getPLNAmount(t);
      if (v > 0) map[k].inn += v; else map[k].out += Math.abs(v);
    });
    return Object.values(map).sort((a,b)=>a.m.localeCompare(b.m)).map(r=>({
      ...r, m: MONTHS[parseInt(r.m.slice(5,7))-1],
    }));
  }, [txs]);

  const catData = useMemo(() => {
    const map = {};
    filtered.filter(t=>t.amount<0).forEach(t => {
      if (!map[t.cat]) map[t.cat] = 0;
      map[t.cat] += Math.abs(getPLNAmount(t));
    });
    return Object.entries(map).map(([name,v])=>({ name, v, color:CAT_COLORS[name]||C.textSub }))
      .sort((a,b)=>b.v-a.v);
  }, [filtered]);

  return (
    <div style={{ padding:"20px 24px", maxWidth:1400, margin:"0 auto" }}>
      {/* Header z filtrem */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 6px 0" }}>Dashboard</h2>
          <p style={{ fontSize:12, color:T.muted, margin:0 }}>{periodLabel(period)}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Metryki */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Saldo", val: (balance>=0?"+":"-")+fmt(balance), color:balance>=0?T.accent:T.red },
          { label:"Przychody", val:"+"+fmt(income), color:T.text },
          { label:"Wydatki", val:"−"+fmt(expense), color:T.red },
          { label:"Oszczędności", val:`${income>0?Math.round((balance/income)*100):0}%`, color:T.accent },
        ].map(m=>(
          <Card key={m.label} style={{ padding:"16px 18px" }}>
            <Label>{m.label}</Label>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:20, fontWeight:500, color:m.color }}>{m.val}</div>
          </Card>
        ))}
      </div>

      {/* Wykresy */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:12, marginBottom:20 }}>
        <Card>
          <Label>Trendy miesięczne</Label>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top:5, right:20, bottom:5, left:0 }}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:11, fill:T.textSub }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:11, fill:T.textSub }} tickFormatter={v=>`${fmtShort(v)}k`} />
              <Tooltip contentStyle={tt} formatter={(v,n)=>[fmt(v), n==="inn"?"Przychód":"Wydatki"]} />
              <Line type="monotone" dataKey="inn" stroke={T.accent} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="out" stroke={T.red} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <Label>Kategorie</Label>
          {catData.length === 0 ? (
            <div style={{ color:T.muted, fontFamily:"DM Mono", fontSize:12, marginTop:20, textAlign:"center", padding:"20px" }}>Brak wydatków</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={catData} dataKey="v" cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3}>
                    {catData.map((c,i)=><Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tt} formatter={v=>[fmt(v)]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:8 }}>
                {catData.map(c=>(
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:T.textSub, alignItems:"center" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:c.color }} />{c.name}
                    </span>
                    <span style={{ color:T.text }}>{fmt(c.v)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Lista transakcji */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <Label style={{ margin:0 }}>Ostatnie transakcje ({filtered.length})</Label>
          <button onClick={onAdd} style={{
            padding:"6px 12px", borderRadius:8, background:T.accent, color:"#06060f",
            border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Outfit,sans-serif"
          }}>+ Dodaj</button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"30px 20px", color:T.muted }}>
            <p style={{ margin:0, fontSize:14 }}>Brak transakcji w tym okresie</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {filtered.reverse().map((tx, idx) => (
              <div key={tx.id} style={{
                padding:"12px 14px",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                gap:12, transition:"all .15s", cursor:"pointer",
                background:expandedTx === tx.id ? T.s2 : "transparent",
              }} onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                  <Avatar initials={tx.who[0]} size={32} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:T.text }}>{tx.desc}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>
                      {tx.cat} • {fmtDate(tx.date)}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    fontFamily:"DM Mono,monospace",
                    fontSize:13, fontWeight:600,
                    color:tx.amount > 0 ? T.accent : T.red,
                  }}>
                    {tx.amount > 0 ? "+" : ""}{fmt(getPLNAmount(tx))}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(tx); }} style={{
                      padding:"4px 8px", background:T.s2, border:`1px solid ${T.border}`, borderRadius:6,
                      color:T.text, cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"Outfit,sans-serif"
                    }}>✎</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }} style={{
                      padding:"4px 8px", background:T.s2, border:`1px solid ${T.red}`, borderRadius:6,
                      color:T.red, cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"Outfit,sans-serif"
                    }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
