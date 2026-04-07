import { useMemo } from 'react';
import { Card, Label } from '../common/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { filterByRange, getRange, periodLabel } from '../../utils/period';
import { getPLNAmount } from '../../utils/currency';
import { fmt, fmtShort, getMonthKey } from '../../utils/formatters';
import { MONTHS, CAT_COLORS, CURRENCIES } from '../../constants/categories';
import { makeTT, DARK } from '../../constants/theme';
import PeriodSelector from '../period/PeriodSelector';

const C = DARK;
const tt = makeTT(C);

export function Dashboard({ txs, onEdit, onDelete, onAdd }) {
  const filtered = useMemo(() => filterByRange(txs, "this_month"), [txs]);

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
    <div style={{ padding:"20px 24px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
        {[
          { label:"Saldo", val: (balance>=0?"+":"-")+fmt(balance), color:balance>=0?C.accent:C.red },
          { label:"Przychody", val:"+"+fmt(income), color:C.text },
          { label:"Wydatki", val:"−"+fmt(expense), color:C.red },
          { label:"Oszczędności", val:`${income>0?Math.round((balance/income)*100):0}%`, color:C.yellow },
        ].map(m=>(
          <Card key={m.label} style={{ padding:"16px 18px" }}>
            <Label>{m.label}</Label>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:20, fontWeight:500, color:m.color }}>{m.val}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:12 }}>
        <Card>
          <Label>Trendy miesięczne</Label>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trendData}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:11, fill:C.textSub }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:11, fill:C.textSub }} tickFormatter={v=>`${fmtShort(v)}k`} />
              <Tooltip contentStyle={tt} formatter={(v,n)=>[fmt(v), n==="inn"?"Przychód":"Wydatki"]} />
              <Line type="monotone" dataKey="inn" stroke={C.accent} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="out" stroke={C.red} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <Label>Kategorie</Label>
          {catData.length === 0 ? (
            <div style={{ color:C.muted, fontFamily:"DM Mono", fontSize:12, marginTop:20 }}>Brak wydatków</div>
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
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:6 }}>
                {catData.map(c=>(
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textSub }}>
                    <span style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:c.color }} />{c.name}
                    </span>
                    <span style={{ color:C.text }}>{fmt(c.v)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
