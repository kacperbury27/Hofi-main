import { useState, useRef, useEffect } from 'react';
import { DARK, LIGHT } from '../../constants/theme';
import { MONTHS, CATS, CAT_COLORS, CURRENCIES, CAT_ICONS } from '../../constants/categories';
import Avatar from '../common/Avatar';
import CatSVG from '../common/CatSVG';
import Snackbar from '../common/Snackbar';
import SlideScreen from '../common/SlideScreen';
import { SettingsSection, SRow, SSwitch, SSelect } from '../settings/SettingsComponents';
import { fmt, fmtDate, getMonthKey } from '../../utils/formatters';
import { getPLNAmount } from '../../utils/currency';
import { TODAY, CURRENT_MONTH_LABEL } from '../../utils/period';
import MiniForm from '../transactions/MiniForm';

const DEMO_USERS = {
  "+48100000001": { name:"Kacper", household:"hh1", role:"owner" },
  "+48100000002": { name:"Anna",   household:null,  role:null  },
};

export function MobileApp({ txs, onSave, onDelete, goals=[], onSaveGoal=()=>{}, onDeleteGoal=()=>{} }) {
  const [darkMode, setDarkMode] = useState(true);
  const T = darkMode ? DARK : LIGHT;

  const [authUser, setAuthUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sName1, setSName1] = useState("Kacper");
  const [sName2, setSName2] = useState("Anna");

  const thisMonth = TODAY.slice(0,7);
  const monthTxs = txs.filter(t=>getMonthKey(t.date)===thisMonth);
  const income = monthTxs.filter(t=>t.amount>0).reduce((a,t)=>a+getPLNAmount(t),0);
  const expense = monthTxs.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
  const balance = income - expense;

  const handleDelete = (id) => {
    const tx = txs.find(t=>t.id===id);
    if (!tx) return;
    onDelete(id);
    if (snackbar?.timer) clearTimeout(snackbar.timer);
    const timer = setTimeout(()=>setSnackbar(null), 4000);
    setSnackbar({ tx, timer });
  };

  const handleUndo = () => {
    if (!snackbar?.tx) return;
    clearTimeout(snackbar.timer);
    onSave(snackbar.tx);
    setSnackbar(null);
  };

  const handleAuth = (user) => {
    setAuthUser(user);
    if (user.name) setSName1(user.name);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.9} }
      @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
      * { scrollbar-width: none; -ms-overflow-style: none; }
      *::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  const NavIcon = ({ type, active }) => {
    const color = active ? T.accent : T.textSub;
    const icons = {
      home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      goals: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill={color}/></svg>,
    };
    return icons[type] || null;
  };

  if (!authUser) {
    return (
      <div style={{ display:"flex", justifyContent:"center", padding:"28px 20px 60px", background:"#F0F4F8" }}>
        <div style={{
          width:375, height:820,
          background:T.bg, borderRadius:46,
          border:`1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          overflow:"hidden", position:"relative",
          boxShadow: darkMode ? "0 40px 80px rgba(0,0,0,.7)" : "0 40px 80px rgba(0,0,0,.18)",
          fontFamily:"Outfit,sans-serif",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px"
        }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:20 }}>HouseFinance</div>
            <button onClick={()=>handleAuth({name:"Kacper", isOwner:true})} style={{
              width:"100%", padding:"14px", background:T.accentGrad, border:"none", borderRadius:16,
              color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", marginBottom:10
            }}>Login - Kacper</button>
            <button onClick={()=>handleAuth({name:"Anna", isOwner:false})} style={{
              width:"100%", padding:"14px", background:T.s2, border:`1px solid ${T.border}`, borderRadius:16,
              color:T.text, fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:14, cursor:"pointer"
            }}>Login - Anna</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"28px 20px 60px", background:"#F0F4F8" }}>
      <div style={{
        width:375, height:820,
        background:T.bg, color:T.text, borderRadius:46,
        border:`1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        overflow:"hidden", position:"relative",
        boxShadow: darkMode ? "0 40px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,0.04)" : "0 40px 80px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,0.04)",
        fontFamily:"Outfit,sans-serif",
      }}>
        {/* Status bar */}
        <div style={{ height:44, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:T.bg }}>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:600, color:T.textSub }}>9:41</span>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>●●●</span>
        </div>

        {/* Content */}
        <div style={{ height:"calc(100% - 44px - 76px)", overflow:"hidden" }}>
          {tab === "home" && (
            <div style={{ overflowY:"auto", height:"100%", background:T.bg, padding:"16px 20px" }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:20, fontWeight:700, color:T.text, marginBottom:20 }}>
                Cześć, {authUser?.name || sName1} 👋
              </div>

              <div style={{
                background: darkMode ? "linear-gradient(145deg,#072B1C 0%,#083050 60%,#0A1E38 100%)" : "linear-gradient(145deg,#007A52 0%,#005E8A 100%)",
                borderRadius:24, padding:"22px 20px 18px",
                boxShadow: darkMode ? `0 20px 60px rgba(0,232,150,0.15), 0 4px 20px rgba(0,0,0,0.5)` : `0 20px 60px rgba(0,120,80,0.35), 0 4px 16px rgba(0,0,0,0.12)`,
                marginBottom:20,
              }}>
                <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.6)", marginBottom:4, letterSpacing:"0.05em" }}>Saldo miesiąca</div>
                <div style={{ fontFamily:"Outfit,sans-serif", fontSize:34, fontWeight:800, color:"#fff", marginBottom:12, letterSpacing:"-0.5px" }}>
                  {balance>=0?"+":"−"}{fmt(Math.abs(balance))}
                </div>
                <div style={{ display:"flex", gap:0 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:3 }}>Wpływy</div>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>+{fmt(income)}</div>
                  </div>
                  <div style={{ flex:1, textAlign:"right" }}>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:3 }}>Wydatki</div>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>−{fmt(expense)}</div>
                  </div>
                </div>
              </div>

              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Ostatnie transakcje</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {txs.slice(0, 5).map(tx=>(
                  <div key={tx.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
                    background:T.s1, border:`1px solid ${T.border}`, borderRadius:12
                  }}>
                    <Avatar who={tx.who} size={32} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:T.text, fontWeight:500 }}>{tx.desc}</div>
                      <div style={{ fontSize:11, color:T.textSub }}>{tx.cat} · {fmtDate(tx.date)}</div>
                    </div>
                    <div style={{ fontFamily:"DM Mono,monospace", fontSize:13, color:tx.amount>0?T.accent:T.text, fontWeight:500 }}>
                      {tx.amount>0?"+":"−"}{fmt(Math.abs(tx.amount), tx.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div style={{ padding:"20px", color:T.textSub, textAlign:"center", marginTop:"40%" }}>
              📊 Analytics - TODO
            </div>
          )}

          {tab === "goals" && (
            <div style={{ padding:"20px", color:T.textSub, textAlign:"center", marginTop:"40%" }}>
              🎯 Goals - TODO
            </div>
          )}
        </div>

        {/* FAB */}
        <button onClick={()=>setShowAdd(true)} style={{
          position:"absolute", bottom:88, right:20, zIndex:150,
          width:54, height:54, borderRadius:18,
          background:T.accentGrad,
          border:"none", fontSize:26, color:"#fff", cursor:"pointer",
          boxShadow:`0 8px 28px ${T.accent}60`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>+</button>

        {/* Snackbar */}
        {snackbar && <Snackbar
          msg="Transakcja usunięta"
          onUndo={handleUndo}
          onClose={()=>{ clearTimeout(snackbar.timer); setSnackbar(null); }}
          theme={T}
        />}

        {/* Bottom nav */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:76,
          background:T.s1, borderTop:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-around",
          padding:"0 8px 10px",
        }}>
          {[
            { key:"home", icon:"home", label:"Główna" },
            { key:"analytics", icon:"analytics", label:"Analityka" },
            { key:"goals", icon:"goals", label:"Cele" },
          ].map(t=>{
            const active = t.key === tab;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                cursor:"pointer", background:"none", border:"none", padding:"4px 16px",
                borderRadius:14, transition:"all .15s",
              }}>
                <div style={{
                  width:36, height:28, borderRadius:10,
                  background: active ? T.accentSoft : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <NavIcon type={t.icon} active={active} />
                </div>
                <span style={{
                  fontFamily:"Outfit,sans-serif", fontSize:10, fontWeight:active?700:400,
                  color: active ? T.accent : T.textSub,
                }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add/Edit bottom sheet */}
        <div style={{
          position:"absolute", inset:0, zIndex:200,
          background: showAdd ? "rgba(0,0,0,0.5)" : "transparent",
          backdropFilter: showAdd ? "blur(4px)" : "none",
          transition:"background .25s",
          pointerEvents: showAdd ? "all" : "none",
          display:"flex", alignItems:"flex-end",
        }} onClick={()=>setShowAdd(false)}>
          <div style={{
            background:T.s1, borderRadius:"28px 28px 0 0", width:"100%",
            border:`1px solid ${T.border}`, borderBottom:"none",
            maxHeight:"92%", overflowY:"auto", boxSizing:"border-box",
            transform: showAdd ? "translateY(0)" : "translateY(100%)",
            transition:"transform .32s cubic-bezier(.4,0,.2,1)",
          }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"center", paddingTop:10, paddingBottom:4 }}>
              <div style={{ width:36, height:4, borderRadius:2, background:T.border }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px 8px" }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, color:T.text }}>Nowa transakcja</div>
              <button onClick={()=>setShowAdd(false)} style={{
                background:T.s2, border:`1px solid ${T.border}`, color:T.textSub,
                width:30, height:30, borderRadius:15, cursor:"pointer", fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>✕</button>
            </div>
            <div style={{ padding:"0 20px 36px" }}>
              {showAdd && <MiniForm
                initial={editTx}
                availableCategories={CATS.map(c=>({name:c, icon:CAT_ICONS[c]}))}
                theme={T}
                onSave={tx=>{
                  onSave(tx);
                  setShowAdd(false);
                  setEditTx(null);
                }}
                onClose={()=>{setShowAdd(false);setEditTx(null);}}
              />}
            </div>
          </div>
        </div>

        {/* Settings */}
        <SlideScreen show={showSettings} zIndex={400} bg={T.bg} color={T.text}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <button onClick={()=>setShowSettings(false)} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.text }}>Ustawienia</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
            <SettingsSection label="Wygląd" theme={T}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px" }}>
                <span style={{ fontSize:18 }}>{darkMode ? "🌑" : "☀️"}</span>
                <div style={{ flex:1, fontSize:13, color:T.text, fontWeight:500 }}>{darkMode ? "Ciemny motyw" : "Jasny motyw"}</div>
                <SSwitch on={darkMode} onToggle={()=>setDarkMode(v=>!v)} theme={T} />
              </div>
            </SettingsSection>
            <button onClick={()=>setAuthUser(null)} style={{
              width:"100%", padding:"14px", background:"transparent",
              border:`1.5px solid ${T.red}50`, borderRadius:14, color:T.red,
              fontFamily:"Outfit,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer",
            }}>Wyloguj się</button>
          </div>
        </SlideScreen>
      </div>
    </div>
  );
}

export default MobileApp;
