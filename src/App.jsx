import { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
// ─── THEME SYSTEM ────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0C0E14", s1: "#13161E", s2: "#1A1E28", s3: "#252A38",
  border: "rgba(255,255,255,0.09)", borderStrong: "rgba(255,255,255,0.16)",
  accent: "#00E896", accentSoft: "rgba(0,232,150,0.14)",
  accentGrad: "linear-gradient(135deg,#00E896 0%,#00C9E0 100%)",
  red: "#FF6B8A", redSoft: "rgba(255,107,138,0.13)",
  blue: "#4CAEFF", yellow: "#FFB547", purple: "#B09BFF", orange:"#FF8A47",
  // text hierarchy: text → textSub → secondary → muted (always readable on dark bg)
  text: "#ECEEF4",    // primary — almost white
  textSub: "#9AA5B4", // secondary — clear gray
  secondary: "#6E7D91",// tertiary — visible subtext
  muted: "#4A5668",   // quaternary — for borders/dividers only, NOT inline text
  dim: "#7A8A9C",     // replaces dim — visible on dark
  card: "rgba(19,22,30,0.97)", glass: "rgba(255,255,255,0.04)",
};
const LIGHT = {
  bg: "#F4F6FA", s1: "#FFFFFF", s2: "#EDF0F7", s3: "#E2E7F0",
  border: "rgba(0,0,0,0.07)", borderStrong: "rgba(0,0,0,0.13)",
  accent: "#00A36B", accentSoft: "rgba(0,163,107,0.10)",
  accentGrad: "linear-gradient(135deg,#00A36B 0%,#0091B8 100%)",
  red: "#D93454", redSoft: "rgba(217,52,84,0.10)",
  blue: "#1E7DE6", yellow: "#D97706", purple: "#6D56C8", orange:"#E0621A",
  // text hierarchy: text → textSub → secondary → muted (always readable on light bg)
  text: "#0D1117",    // primary — near black
  textSub: "#374151", // secondary — dark gray (was #4B5563)
  secondary: "#6B7280",// tertiary — medium gray
  muted: "#9CA3AF",   // quaternary — for borders/dividers only
  dim: "#6B7280",     // replaces dim — visible on light
  card: "#FFFFFF", glass: "rgba(0,0,0,0.02)",
};
// C will be set dynamically in MobileApp based on darkMode state
// For dashboard and static code, use DARK as default
const C = DARK;

const makeTT = (theme) => ({
  backgroundColor: theme.s2,
  border: `1px solid ${theme.borderStrong}`,
  color: theme.text, fontFamily: "Outfit,sans-serif",
  fontSize: 12, borderRadius: 8,
});
const tt = makeTT(DARK);

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const MONTHS = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];
const CATS = ["Jedzenie","Transport","Mieszkanie","Rozrywka","Zdrowie","Subskrypcje","Inne"];
const CAT_COLORS = {
  Jedzenie: C.yellow, Transport: C.blue, Mieszkanie: C.accent,
  Rozrywka: C.red, Zdrowie: "#4ade80", Subskrypcje: C.purple, Inne: C.textSub,
};
const CURRENCIES = ["PLN","EUR","USD","GBP"];

// ─── SEED GOALS ──────────────────────────────────────────────────────────────
const seedGoals = [
  {
    id:"g1", name:"Wakacje w Japonii", type:"savings",
    target:12000, currency:"PLN", deadline:"2026-09-01",
    createdAt:"2025-10-01", status:"active",
    color:"#4CAEFF",
    deposits:[
      { id:"d1", amount:500, currency:"PLN", date:"2025-10-25", note:"Pierwsza wpłata", who:"Kacper" },
      { id:"d2", amount:500, currency:"PLN", date:"2025-11-25", note:"", who:"Kacper" },
      { id:"d3", amount:500, currency:"PLN", date:"2025-12-25", note:"", who:"Anna" },
      { id:"d4", amount:800, currency:"PLN", date:"2026-01-25", note:"Premia", who:"Kacper" },
      { id:"d5", amount:500, currency:"PLN", date:"2026-02-25", note:"", who:"Anna" },
      { id:"d6", amount:500, currency:"PLN", date:"2026-03-25", note:"", who:"Kacper" },
    ],
  },
  {
    id:"g2", name:"Fundusz awaryjny", type:"savings",
    target:30000, currency:"PLN", deadline:null,
    createdAt:"2024-01-01", status:"active",
    color:"#00E896",
    deposits:[
      { id:"d10", amount:2000, currency:"PLN", date:"2024-03-01", note:"Start", who:"Kacper" },
      { id:"d11", amount:1000, currency:"PLN", date:"2024-06-01", note:"", who:"Anna" },
      { id:"d12", amount:1500, currency:"PLN", date:"2024-09-01", note:"", who:"Kacper" },
      { id:"d13", amount:1000, currency:"PLN", date:"2025-01-01", note:"", who:"Anna" },
      { id:"d14", amount:2000, currency:"PLN", date:"2025-06-01", note:"", who:"Kacper" },
    ],
  },
  {
    id:"g3", name:"Remont kuchni", type:"budget",
    target:15000, currency:"PLN", deadline:"2026-12-01",
    createdAt:"2026-01-01", status:"active",
    color:"#FFB547",
    deposits:[
      { id:"d20", amount:1000, currency:"PLN", date:"2026-01-15", note:"Projekt", who:"Anna" },
      { id:"d21", amount:2500, currency:"PLN", date:"2026-02-20", note:"Materiały", who:"Kacper" },
    ],
  },
  {
    id:"g4", name:"Nowe auto — wkład własny", type:"savings",
    target:20000, currency:"PLN", deadline:"2027-06-01",
    createdAt:"2026-02-01", status:"active",
    color:"#A78BFA",
    deposits:[
      { id:"d30", amount:1000, currency:"PLN", date:"2026-02-25", note:"", who:"Kacper" },
      { id:"d31", amount:1000, currency:"PLN", date:"2026-03-25", note:"", who:"Kacper" },
    ],
  },
];
let nextGoalId = 5;
let nextDepositId = 40;

const seedTx = [
  // ── 2025-03 March ──
  { id:1,  desc:"Biedronka",        cat:"Jedzenie",    amount:-89.5,  who:"Kacper", date:"2025-03-25", currency:"PLN", type:"expense" },
  { id:2,  desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2025-03-25", currency:"PLN", type:"income"  },
  { id:3,  desc:"Spotify",          cat:"Subskrypcje", amount:-9.99,  who:"Anna",   date:"2025-03-24", currency:"EUR", type:"expense" },
  { id:4,  desc:"Orlen",            cat:"Transport",   amount:-180,   who:"Kacper", date:"2025-03-24", currency:"PLN", type:"expense" },
  { id:5,  desc:"Żabka",            cat:"Jedzenie",    amount:-14.5,  who:"Anna",   date:"2025-03-23", currency:"PLN", type:"expense" },
  { id:6,  desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2025-03-22", currency:"PLN", type:"expense" },
  { id:7,  desc:"Allegro",          cat:"Inne",        amount:-127,   who:"Kacper", date:"2025-03-21", currency:"PLN", type:"expense" },
  { id:8,  desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-03-01", currency:"PLN", type:"expense" },
  { id:9,  desc:"Apteka",           cat:"Zdrowie",     amount:-45.8,  who:"Anna",   date:"2025-03-18", currency:"PLN", type:"expense" },
  { id:10, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2025-03-10", currency:"PLN", type:"income"  },
  { id:11, desc:"Lidl",             cat:"Jedzenie",    amount:-203.4, who:"Anna",   date:"2025-03-15", currency:"PLN", type:"expense" },
  { id:12, desc:"Parking",          cat:"Transport",   amount:-30,    who:"Kacper", date:"2025-03-13", currency:"PLN", type:"expense" },
  // ── 2025-02 February ──
  { id:13, desc:"Biedronka",        cat:"Jedzenie",    amount:-112,   who:"Anna",   date:"2025-02-28", currency:"PLN", type:"expense" },
  { id:14, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2025-02-25", currency:"PLN", type:"income"  },
  { id:15, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2025-02-10", currency:"PLN", type:"income"  },
  { id:16, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-02-01", currency:"PLN", type:"expense" },
  { id:17, desc:"Zalando",          cat:"Inne",        amount:-240,   who:"Anna",   date:"2025-02-14", currency:"PLN", type:"expense" },
  { id:18, desc:"Paliwo",           cat:"Transport",   amount:-220,   who:"Kacper", date:"2025-02-20", currency:"PLN", type:"expense" },
  { id:19, desc:"Restauracja",      cat:"Jedzenie",    amount:-187,   who:"Kacper", date:"2025-02-16", currency:"PLN", type:"expense" },
  { id:20, desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2025-02-05", currency:"PLN", type:"expense" },
  // ── 2025-01 January ──
  { id:21, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-01-01", currency:"PLN", type:"expense" },
  { id:22, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2025-01-25", currency:"PLN", type:"income"  },
  { id:23, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2025-01-10", currency:"PLN", type:"income"  },
  { id:24, desc:"Media",            cat:"Mieszkanie",  amount:-340,   who:"Anna",   date:"2025-01-15", currency:"PLN", type:"expense" },
  { id:25, desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2025-01-05", currency:"PLN", type:"expense" },
  { id:26, desc:"Ikea",             cat:"Inne",        amount:-560,   who:"Anna",   date:"2025-01-20", currency:"PLN", type:"expense" },
  { id:27, desc:"Orlen",            cat:"Transport",   amount:-195,   who:"Kacper", date:"2025-01-18", currency:"PLN", type:"expense" },
  // ── 2024-12 December ──
  { id:28, desc:"Wypłata — Kacper", cat:"Przychód",    amount:9200,   who:"Kacper", date:"2024-12-25", currency:"PLN", type:"income"  },
  { id:29, desc:"Wypłata — Anna",   cat:"Przychód",    amount:7800,   who:"Anna",   date:"2024-12-10", currency:"PLN", type:"income"  },
  { id:30, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2024-12-01", currency:"PLN", type:"expense" },
  { id:31, desc:"Zakupy świąteczne",cat:"Inne",        amount:-1240,  who:"Anna",   date:"2024-12-18", currency:"PLN", type:"expense" },
  { id:32, desc:"Lidl",             cat:"Jedzenie",    amount:-380,   who:"Anna",   date:"2024-12-22", currency:"PLN", type:"expense" },
  { id:33, desc:"Paliwo",           cat:"Transport",   amount:-190,   who:"Kacper", date:"2024-12-14", currency:"PLN", type:"expense" },
  { id:34, desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2024-12-05", currency:"PLN", type:"expense" },
  { id:35, desc:"Restauracja",      cat:"Jedzenie",    amount:-310,   who:"Kacper", date:"2024-12-20", currency:"PLN", type:"expense" },
  // ── 2024-11 November ──
  { id:36, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2024-11-25", currency:"PLN", type:"income"  },
  { id:37, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2024-11-10", currency:"PLN", type:"income"  },
  { id:38, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2024-11-01", currency:"PLN", type:"expense" },
  { id:39, desc:"Biedronka",        cat:"Jedzenie",    amount:-145,   who:"Anna",   date:"2024-11-20", currency:"PLN", type:"expense" },
  { id:40, desc:"Dentysta",         cat:"Zdrowie",     amount:-450,   who:"Anna",   date:"2024-11-12", currency:"PLN", type:"expense" },
  { id:41, desc:"Allegro",          cat:"Inne",        amount:-199,   who:"Kacper", date:"2024-11-08", currency:"PLN", type:"expense" },
  { id:42, desc:"Parking",          cat:"Transport",   amount:-60,    who:"Kacper", date:"2024-11-25", currency:"PLN", type:"expense" },
  // ── 2024-10 October ──
  { id:43, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2024-10-25", currency:"PLN", type:"income"  },
  { id:44, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2024-10-10", currency:"PLN", type:"income"  },
  { id:45, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2024-10-01", currency:"PLN", type:"expense" },
  { id:46, desc:"Lidl",             cat:"Jedzenie",    amount:-178,   who:"Anna",   date:"2024-10-17", currency:"PLN", type:"expense" },
  { id:47, desc:"Orlen",            cat:"Transport",   amount:-210,   who:"Kacper", date:"2024-10-10", currency:"PLN", type:"expense" },
  { id:48, desc:"Spotify",          cat:"Subskrypcje", amount:-9.99,  who:"Anna",   date:"2024-10-24", currency:"EUR", type:"expense" },
  { id:49, desc:"Urlop Wiedeń",     cat:"Rozrywka",    amount:-2200,  who:"Kacper", date:"2024-10-05", currency:"EUR", type:"expense" },
  // ── 2024-09 September ──
  { id:50, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2024-09-25", currency:"PLN", type:"income"  },
  { id:51, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2024-09-10", currency:"PLN", type:"income"  },
  { id:52, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2024-09-01", currency:"PLN", type:"expense" },
  { id:53, desc:"Biedronka",        cat:"Jedzenie",    amount:-98,    who:"Anna",   date:"2024-09-14", currency:"PLN", type:"expense" },
  { id:54, desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2024-09-05", currency:"PLN", type:"expense" },
  { id:55, desc:"Paliwo",           cat:"Transport",   amount:-175,   who:"Kacper", date:"2024-09-20", currency:"PLN", type:"expense" },
  // ── 2024-08 August ──
  { id:56, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2024-08-25", currency:"PLN", type:"income"  },
  { id:57, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2024-08-10", currency:"PLN", type:"income"  },
  { id:58, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2024-08-01", currency:"PLN", type:"expense" },
  { id:59, desc:"Wakacje Grecja",   cat:"Rozrywka",    amount:-3400,  who:"Anna",   date:"2024-08-12", currency:"EUR", type:"expense" },
  { id:60, desc:"Lidl",             cat:"Jedzenie",    amount:-132,   who:"Anna",   date:"2024-08-28", currency:"PLN", type:"expense" },
  { id:61, desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2024-08-05", currency:"PLN", type:"expense" },
  // ── 2024-07 July ──
  { id:62, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2024-07-25", currency:"PLN", type:"income"  },
  { id:63, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2024-07-10", currency:"PLN", type:"income"  },
  { id:64, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-07-01", currency:"PLN", type:"expense" },
  { id:65, desc:"Biedronka",        cat:"Jedzenie",    amount:-156,   who:"Anna",   date:"2024-07-18", currency:"PLN", type:"expense" },
  { id:66, desc:"Paliwo",           cat:"Transport",   amount:-210,   who:"Kacper", date:"2024-07-12", currency:"PLN", type:"expense" },
  { id:67, desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2024-07-06", currency:"PLN", type:"expense" },
  { id:68, desc:"Steam",            cat:"Rozrywka",    amount:-129,   who:"Kacper", date:"2024-07-22", currency:"PLN", type:"expense" },
  // ── 2024-06 June ──
  { id:69, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2024-06-25", currency:"PLN", type:"income"  },
  { id:70, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2024-06-10", currency:"PLN", type:"income"  },
  { id:71, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-06-01", currency:"PLN", type:"expense" },
  { id:72, desc:"Lidl",             cat:"Jedzenie",    amount:-142,   who:"Anna",   date:"2024-06-20", currency:"PLN", type:"expense" },
  { id:73, desc:"Orlen",            cat:"Transport",   amount:-185,   who:"Kacper", date:"2024-06-15", currency:"PLN", type:"expense" },
  { id:74, desc:"Koncert",          cat:"Rozrywka",    amount:-280,   who:"Anna",   date:"2024-06-08", currency:"PLN", type:"expense" },
  { id:75, desc:"Apteka",           cat:"Zdrowie",     amount:-67,    who:"Anna",   date:"2024-06-25", currency:"PLN", type:"expense" },
  // ── 2024-05 May ──
  { id:76, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7200,   who:"Kacper", date:"2024-05-25", currency:"PLN", type:"income"  },
  { id:77, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6200,   who:"Anna",   date:"2024-05-10", currency:"PLN", type:"income"  },
  { id:78, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-05-01", currency:"PLN", type:"expense" },
  { id:79, desc:"Biedronka",        cat:"Jedzenie",    amount:-118,   who:"Anna",   date:"2024-05-22", currency:"PLN", type:"expense" },
  { id:80, desc:"Media",            cat:"Mieszkanie",  amount:-310,   who:"Anna",   date:"2024-05-15", currency:"PLN", type:"expense" },
  { id:81, desc:"Parking",          cat:"Transport",   amount:-45,    who:"Kacper", date:"2024-05-18", currency:"PLN", type:"expense" },
  { id:82, desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2024-05-05", currency:"PLN", type:"expense" },
  // ── 2024-04 April ──
  { id:83, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7200,   who:"Kacper", date:"2024-04-25", currency:"PLN", type:"income"  },
  { id:84, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6200,   who:"Anna",   date:"2024-04-10", currency:"PLN", type:"income"  },
  { id:85, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-04-01", currency:"PLN", type:"expense" },
  { id:86, desc:"Wielkanoc zakupy", cat:"Jedzenie",    amount:-420,   who:"Anna",   date:"2024-04-15", currency:"PLN", type:"expense" },
  { id:87, desc:"Paliwo",           cat:"Transport",   amount:-190,   who:"Kacper", date:"2024-04-20", currency:"PLN", type:"expense" },
  { id:88, desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2024-04-05", currency:"PLN", type:"expense" },
  // ── 2024-03 March ──
  { id:89, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7200,   who:"Kacper", date:"2024-03-25", currency:"PLN", type:"income"  },
  { id:90, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6200,   who:"Anna",   date:"2024-03-10", currency:"PLN", type:"income"  },
  { id:91, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-03-01", currency:"PLN", type:"expense" },
  { id:92, desc:"Biedronka",        cat:"Jedzenie",    amount:-134,   who:"Anna",   date:"2024-03-18", currency:"PLN", type:"expense" },
  { id:93, desc:"Naprawa auta",     cat:"Transport",   amount:-680,   who:"Kacper", date:"2024-03-10", currency:"PLN", type:"expense" },
  { id:94, desc:"Spotify",          cat:"Subskrypcje", amount:-9.99,  who:"Anna",   date:"2024-03-24", currency:"EUR", type:"expense" },
  { id:95, desc:"Kino",             cat:"Rozrywka",    amount:-80,    who:"Kacper", date:"2024-03-22", currency:"PLN", type:"expense" },
  // ── 2024-02 February ──
  { id:96, desc:"Wypłata — Kacper", cat:"Przychód",    amount:7200,   who:"Kacper", date:"2024-02-25", currency:"PLN", type:"income"  },
  { id:97, desc:"Wypłata — Anna",   cat:"Przychód",    amount:6200,   who:"Anna",   date:"2024-02-10", currency:"PLN", type:"income"  },
  { id:98, desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-02-01", currency:"PLN", type:"expense" },
  { id:99, desc:"Walentynki",       cat:"Rozrywka",    amount:-320,   who:"Kacper", date:"2024-02-14", currency:"PLN", type:"expense" },
  { id:100,desc:"Lidl",             cat:"Jedzenie",    amount:-108,   who:"Anna",   date:"2024-02-20", currency:"PLN", type:"expense" },
  { id:101,desc:"Paliwo",           cat:"Transport",   amount:-185,   who:"Kacper", date:"2024-02-18", currency:"PLN", type:"expense" },
  // ── 2024-01 January ──
  { id:102,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7200,   who:"Kacper", date:"2024-01-25", currency:"PLN", type:"income"  },
  { id:103,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6200,   who:"Anna",   date:"2024-01-10", currency:"PLN", type:"income"  },
  { id:104,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2024-01-01", currency:"PLN", type:"expense" },
  { id:105,desc:"Media",            cat:"Mieszkanie",  amount:-420,   who:"Anna",   date:"2024-01-15", currency:"PLN", type:"expense" },
  { id:106,desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2024-01-05", currency:"PLN", type:"expense" },
  { id:107,desc:"Nowy laptop",      cat:"Inne",        amount:-3200,  who:"Kacper", date:"2024-01-28", currency:"PLN", type:"expense" },
  // ── 2023-12 December ──
  { id:108,desc:"Wypłata — Kacper", cat:"Przychód",    amount:8800,   who:"Kacper", date:"2023-12-25", currency:"PLN", type:"income"  },
  { id:109,desc:"Wypłata — Anna",   cat:"Przychód",    amount:7200,   who:"Anna",   date:"2023-12-10", currency:"PLN", type:"income"  },
  { id:110,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1800,  who:"Kacper", date:"2023-12-01", currency:"PLN", type:"expense" },
  { id:111,desc:"Święta zakupy",    cat:"Jedzenie",    amount:-560,   who:"Anna",   date:"2023-12-22", currency:"PLN", type:"expense" },
  { id:112,desc:"Prezenty",         cat:"Inne",        amount:-880,   who:"Anna",   date:"2023-12-18", currency:"PLN", type:"expense" },
  { id:113,desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2023-12-05", currency:"PLN", type:"expense" },
  // ── 2023-11 November ──
  { id:114,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7000,   who:"Kacper", date:"2023-11-25", currency:"PLN", type:"income"  },
  { id:115,desc:"Wypłata — Anna",   cat:"Przychód",    amount:5800,   who:"Anna",   date:"2023-11-10", currency:"PLN", type:"income"  },
  { id:116,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1700,  who:"Kacper", date:"2023-11-01", currency:"PLN", type:"expense" },
  { id:117,desc:"Biedronka",        cat:"Jedzenie",    amount:-128,   who:"Anna",   date:"2023-11-20", currency:"PLN", type:"expense" },
  { id:118,desc:"Orlen",            cat:"Transport",   amount:-175,   who:"Kacper", date:"2023-11-15", currency:"PLN", type:"expense" },
  // ── 2023-10 October ──
  { id:119,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7000,   who:"Kacper", date:"2023-10-25", currency:"PLN", type:"income"  },
  { id:120,desc:"Wypłata — Anna",   cat:"Przychód",    amount:5800,   who:"Anna",   date:"2023-10-10", currency:"PLN", type:"income"  },
  { id:121,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1700,  who:"Kacper", date:"2023-10-01", currency:"PLN", type:"expense" },
  { id:122,desc:"Urlop Portugalia", cat:"Rozrywka",    amount:-4200,  who:"Kacper", date:"2023-10-08", currency:"EUR", type:"expense" },
  { id:123,desc:"Paliwo",           cat:"Transport",   amount:-180,   who:"Kacper", date:"2023-10-20", currency:"PLN", type:"expense" },
  // ── 2023-09 September ──
  { id:124,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7000,   who:"Kacper", date:"2023-09-25", currency:"PLN", type:"income"  },
  { id:125,desc:"Wypłata — Anna",   cat:"Przychód",    amount:5800,   who:"Anna",   date:"2023-09-10", currency:"PLN", type:"income"  },
  { id:126,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1700,  who:"Kacper", date:"2023-09-01", currency:"PLN", type:"expense" },
  { id:127,desc:"Biedronka",        cat:"Jedzenie",    amount:-95,    who:"Anna",   date:"2023-09-18", currency:"PLN", type:"expense" },
  { id:128,desc:"Siłownia",         cat:"Zdrowie",     amount:-89,    who:"Kacper", date:"2023-09-05", currency:"PLN", type:"expense" },
  // ── 2023-08 August ──
  { id:129,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7000,   who:"Kacper", date:"2023-08-25", currency:"PLN", type:"income"  },
  { id:130,desc:"Wypłata — Anna",   cat:"Przychód",    amount:5800,   who:"Anna",   date:"2023-08-10", currency:"PLN", type:"income"  },
  { id:131,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1700,  who:"Kacper", date:"2023-08-01", currency:"PLN", type:"expense" },
  { id:132,desc:"Wakacje Chorwacja",cat:"Rozrywka",    amount:-2800,  who:"Kacper", date:"2023-08-10", currency:"EUR", type:"expense" },
  { id:133,desc:"Lidl",             cat:"Jedzenie",    amount:-122,   who:"Anna",   date:"2023-08-25", currency:"PLN", type:"expense" },
  // ── 2025-04 April 2025 ──
  { id:134,desc:"Biedronka",        cat:"Jedzenie",    amount:-97.5,  who:"Anna",   date:"2025-04-22", currency:"PLN", type:"expense" },
  { id:135,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2025-04-25", currency:"PLN", type:"income"  },
  { id:136,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2025-04-10", currency:"PLN", type:"income"  },
  { id:137,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-04-01", currency:"PLN", type:"expense" },
  { id:138,desc:"Orlen",            cat:"Transport",   amount:-165,   who:"Kacper", date:"2025-04-15", currency:"PLN", type:"expense" },
  { id:139,desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2025-04-05", currency:"PLN", type:"expense" },
  { id:140,desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2025-04-06", currency:"PLN", type:"expense" },
  // ── 2025-05 May 2025 ──
  { id:141,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7500,   who:"Kacper", date:"2025-05-25", currency:"PLN", type:"income"  },
  { id:142,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6400,   who:"Anna",   date:"2025-05-10", currency:"PLN", type:"income"  },
  { id:143,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-05-01", currency:"PLN", type:"expense" },
  { id:144,desc:"Lidl",             cat:"Jedzenie",    amount:-188,   who:"Anna",   date:"2025-05-20", currency:"PLN", type:"expense" },
  { id:145,desc:"Paliwo",           cat:"Transport",   amount:-195,   who:"Kacper", date:"2025-05-18", currency:"PLN", type:"expense" },
  { id:146,desc:"Spotify",          cat:"Subskrypcje", amount:-9.99,  who:"Anna",   date:"2025-05-24", currency:"EUR", type:"expense" },
  // ── 2025-06 June 2025 ──
  { id:147,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7800,   who:"Kacper", date:"2025-06-25", currency:"PLN", type:"income"  },
  { id:148,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6600,   who:"Anna",   date:"2025-06-10", currency:"PLN", type:"income"  },
  { id:149,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-06-01", currency:"PLN", type:"expense" },
  { id:150,desc:"Koncert",          cat:"Rozrywka",    amount:-320,   who:"Anna",   date:"2025-06-14", currency:"PLN", type:"expense" },
  { id:151,desc:"Biedronka",        cat:"Jedzenie",    amount:-143,   who:"Anna",   date:"2025-06-22", currency:"PLN", type:"expense" },
  { id:152,desc:"Apteka",           cat:"Zdrowie",     amount:-78,    who:"Anna",   date:"2025-06-18", currency:"PLN", type:"expense" },
  // ── 2025-07 July 2025 ──
  { id:153,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7800,   who:"Kacper", date:"2025-07-25", currency:"PLN", type:"income"  },
  { id:154,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6600,   who:"Anna",   date:"2025-07-10", currency:"PLN", type:"income"  },
  { id:155,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-07-01", currency:"PLN", type:"expense" },
  { id:156,desc:"Wakacje Włochy",   cat:"Rozrywka",    amount:-2800,  who:"Kacper", date:"2025-07-12", currency:"EUR", type:"expense" },
  { id:157,desc:"Lidl",             cat:"Jedzenie",    amount:-167,   who:"Anna",   date:"2025-07-28", currency:"PLN", type:"expense" },
  // ── 2025-08 August 2025 ──
  { id:158,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7800,   who:"Kacper", date:"2025-08-25", currency:"PLN", type:"income"  },
  { id:159,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6600,   who:"Anna",   date:"2025-08-10", currency:"PLN", type:"income"  },
  { id:160,desc:"Czynsz",           cat:"Mieszkanie",  amount:-1900,  who:"Kacper", date:"2025-08-01", currency:"PLN", type:"expense" },
  { id:161,desc:"Biedronka",        cat:"Jedzenie",    amount:-112,   who:"Anna",   date:"2025-08-20", currency:"PLN", type:"expense" },
  { id:162,desc:"Allegro",          cat:"Inne",        amount:-289,   who:"Kacper", date:"2025-08-15", currency:"PLN", type:"expense" },
  { id:163,desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2025-08-05", currency:"PLN", type:"expense" },
  // ── 2025-09 September 2025 ──
  { id:164,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7800,   who:"Kacper", date:"2025-09-25", currency:"PLN", type:"income"  },
  { id:165,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6800,   who:"Anna",   date:"2025-09-10", currency:"PLN", type:"income"  },
  { id:166,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2025-09-01", currency:"PLN", type:"expense" },
  { id:167,desc:"Paliwo",           cat:"Transport",   amount:-210,   who:"Kacper", date:"2025-09-18", currency:"PLN", type:"expense" },
  { id:168,desc:"Zalando",          cat:"Inne",        amount:-340,   who:"Anna",   date:"2025-09-22", currency:"PLN", type:"expense" },
  // ── 2025-10 October 2025 ──
  { id:169,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7800,   who:"Kacper", date:"2025-10-25", currency:"PLN", type:"income"  },
  { id:170,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6800,   who:"Anna",   date:"2025-10-10", currency:"PLN", type:"income"  },
  { id:171,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2025-10-01", currency:"PLN", type:"expense" },
  { id:172,desc:"Urlop Madryt",     cat:"Rozrywka",    amount:-1900,  who:"Anna",   date:"2025-10-08", currency:"EUR", type:"expense" },
  { id:173,desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2025-10-05", currency:"PLN", type:"expense" },
  { id:174,desc:"Orlen",            cat:"Transport",   amount:-225,   who:"Kacper", date:"2025-10-14", currency:"PLN", type:"expense" },
  // ── 2025-11 November 2025 ──
  { id:175,desc:"Wypłata — Kacper", cat:"Przychód",    amount:7800,   who:"Kacper", date:"2025-11-25", currency:"PLN", type:"income"  },
  { id:176,desc:"Wypłata — Anna",   cat:"Przychód",    amount:6800,   who:"Anna",   date:"2025-11-10", currency:"PLN", type:"income"  },
  { id:177,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2025-11-01", currency:"PLN", type:"expense" },
  { id:178,desc:"Biedronka",        cat:"Jedzenie",    amount:-156,   who:"Anna",   date:"2025-11-20", currency:"PLN", type:"expense" },
  { id:179,desc:"Siłownia",         cat:"Zdrowie",     amount:-99,    who:"Kacper", date:"2025-11-05", currency:"PLN", type:"expense" },
  { id:180,desc:"Media",            cat:"Mieszkanie",  amount:-390,   who:"Anna",   date:"2025-11-15", currency:"PLN", type:"expense" },
  // ── 2025-12 December 2025 ──
  { id:181,desc:"Wypłata — Kacper", cat:"Przychód",    amount:9500,   who:"Kacper", date:"2025-12-25", currency:"PLN", type:"income"  },
  { id:182,desc:"Wypłata — Anna",   cat:"Przychód",    amount:8200,   who:"Anna",   date:"2025-12-10", currency:"PLN", type:"income"  },
  { id:183,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2025-12-01", currency:"PLN", type:"expense" },
  { id:184,desc:"Zakupy świąteczne",cat:"Inne",        amount:-1380,  who:"Anna",   date:"2025-12-18", currency:"PLN", type:"expense" },
  { id:185,desc:"Restauracja",      cat:"Jedzenie",    amount:-430,   who:"Kacper", date:"2025-12-24", currency:"PLN", type:"expense" },
  { id:186,desc:"Spotify",          cat:"Subskrypcje", amount:-9.99,  who:"Anna",   date:"2025-12-05", currency:"EUR", type:"expense" },
  // ── 2026-01 January 2026 ──
  { id:187,desc:"Wypłata — Kacper", cat:"Przychód",    amount:8200,   who:"Kacper", date:"2026-01-25", currency:"PLN", type:"income"  },
  { id:188,desc:"Wypłata — Anna",   cat:"Przychód",    amount:7000,   who:"Anna",   date:"2026-01-10", currency:"PLN", type:"income"  },
  { id:189,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2026-01-01", currency:"PLN", type:"expense" },
  { id:190,desc:"Media",            cat:"Mieszkanie",  amount:-440,   who:"Anna",   date:"2026-01-15", currency:"PLN", type:"expense" },
  { id:191,desc:"Nowy rower",       cat:"Rozrywka",    amount:-1800,  who:"Kacper", date:"2026-01-20", currency:"PLN", type:"expense" },
  { id:192,desc:"Siłownia",         cat:"Zdrowie",     amount:-119,   who:"Kacper", date:"2026-01-06", currency:"PLN", type:"expense" },
  { id:193,desc:"Lidl",             cat:"Jedzenie",    amount:-178,   who:"Anna",   date:"2026-01-22", currency:"PLN", type:"expense" },
  // ── 2026-02 February 2026 ──
  { id:194,desc:"Wypłata — Kacper", cat:"Przychód",    amount:8200,   who:"Kacper", date:"2026-02-25", currency:"PLN", type:"income"  },
  { id:195,desc:"Wypłata — Anna",   cat:"Przychód",    amount:7000,   who:"Anna",   date:"2026-02-10", currency:"PLN", type:"income"  },
  { id:196,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2026-02-01", currency:"PLN", type:"expense" },
  { id:197,desc:"Walentynki",       cat:"Rozrywka",    amount:-380,   who:"Kacper", date:"2026-02-14", currency:"PLN", type:"expense" },
  { id:198,desc:"Biedronka",        cat:"Jedzenie",    amount:-134,   who:"Anna",   date:"2026-02-20", currency:"PLN", type:"expense" },
  { id:199,desc:"Paliwo",           cat:"Transport",   amount:-245,   who:"Kacper", date:"2026-02-18", currency:"PLN", type:"expense" },
  // ── 2026-03 March 2026 ──
  { id:200,desc:"Wypłata — Kacper", cat:"Przychód",    amount:8200,   who:"Kacper", date:"2026-03-25", currency:"PLN", type:"income"  },
  { id:201,desc:"Wypłata — Anna",   cat:"Przychód",    amount:7000,   who:"Anna",   date:"2026-03-10", currency:"PLN", type:"income"  },
  { id:202,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2026-03-01", currency:"PLN", type:"expense" },
  { id:203,desc:"Lidl",             cat:"Jedzenie",    amount:-156,   who:"Anna",   date:"2026-03-22", currency:"PLN", type:"expense" },
  { id:204,desc:"Orlen",            cat:"Transport",   amount:-230,   who:"Kacper", date:"2026-03-15", currency:"PLN", type:"expense" },
  { id:205,desc:"Netflix",          cat:"Subskrypcje", amount:-56,    who:"Anna",   date:"2026-03-05", currency:"PLN", type:"expense" },
  { id:206,desc:"Siłownia",         cat:"Zdrowie",     amount:-119,   who:"Kacper", date:"2026-03-06", currency:"PLN", type:"expense" },
  // ── 2026-04 April 2026 (current month) ──
  { id:207,desc:"Czynsz",           cat:"Mieszkanie",  amount:-2000,  who:"Kacper", date:"2026-04-01", currency:"PLN", type:"expense" },
  { id:208,desc:"Biedronka",        cat:"Jedzenie",    amount:-89,    who:"Anna",   date:"2026-04-02", currency:"PLN", type:"expense" },
  { id:209,desc:"Wypłata — Kacper", cat:"Przychód",    amount:8200,   who:"Kacper", date:"2026-04-01", currency:"PLN", type:"income"  },
];

let nextId = 210;


// ─── HELPERS ─────────────────────────────────────────────────────────────────
// ─── DATE FORMATTER ─────────────────────────────────────────────────────────
// "yyyy-mm-dd" → "dd/mm/yyyy" | "yyyy-mm" → "mm/yyyy"
const fmtDate = (d) => {
  if (!d) return "";
  const parts = d.slice(0,10).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
  return d;
};

const fmt = (v, cur="PLN") =>
  `${Math.abs(v).toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} ${cur}`;

const fmtShort = (v) =>
  Math.abs(v) >= 1000
    ? `${(Math.abs(v)/1000).toFixed(1)}k`
    : Math.abs(v).toFixed(0);

const getMonthKey = (d) => d.slice(0,7);
const getPLNAmount = (tx) => {
  const rates = { PLN:1, EUR:4.28, USD:3.91, GBP:4.95 };
  return tx.amount * (rates[tx.currency]||1);
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.s1, border:`1px solid ${C.border}`, borderRadius:14, padding:20, ...style }}>
    {children}
  </div>
);
const Label = ({ children }) => (
  <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, letterSpacing:"0.15em", color:C.muted, textTransform:"uppercase", marginBottom:10 }}>
    {children}
  </div>
);
const Chip = ({ label, active, color=C.accent, onClick }) => (
  <button onClick={onClick} style={{
    padding:"6px 13px", borderRadius:20,
    border:`1px solid ${active ? color : C.border}`,
    background: active ? `${color}20` : "transparent",
    color: active ? color : C.textSub,
    fontSize:12, fontFamily:"DM Mono,monospace",
    cursor:"pointer", transition:"all .15s",
  }}>{label}</button>
);

// ─── WHO AVATAR ──────────────────────────────────────────────────────────────
const Avatar = ({ who, size=32 }) => {
  const isK = who === "Kacper";
  return (
    <div style={{
      width:size, height:size, borderRadius:size/2.5,
      background: isK ? `${C.blue}22` : `${C.purple}22`,
      border:`1px solid ${isK ? C.blue : C.purple}55`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.36, fontWeight:700, color:isK ? C.blue : C.purple,
      fontFamily:"DM Mono,monospace", flexShrink:0,
    }}>
      {who[0]}
    </div>
  );
};

// ─── TRANSACTION ROW ─────────────────────────────────────────────────────────
const TxRow = ({ tx, onEdit, onDelete, compact=false }) => (
  <div style={{
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding: compact ? "9px 14px" : "11px 16px",
    background:C.s1, borderRadius:13, border:`1px solid ${C.border}`,
    gap:10,
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
      <Avatar who={tx.who} size={compact?30:34} />
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:compact?12:13, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.desc}</div>
        <div style={{ fontSize:11, color:C.muted, fontFamily:"DM Mono,monospace" }}>
          {tx.cat} · {fmtDate(tx.date)} · {tx.who}
        </div>
      </div>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
      <div style={{
        fontFamily:"DM Mono,monospace", fontSize:compact?12:13,
        color: tx.amount > 0 ? C.accent : C.text, fontWeight:500,
      }}>
        {tx.amount > 0 ? "+" : "−"}{fmt(tx.amount, tx.currency)}
      </div>
      {(onEdit || onDelete) && (
        <div style={{ display:"flex", gap:4 }}>
          {onEdit && (
            <button onClick={() => onEdit(tx)} style={{
              background:C.s2, border:`1px solid ${C.border}`,
              color:C.textSub, borderRadius:7, padding:"4px 8px",
              fontSize:11, cursor:"pointer", fontFamily:"DM Mono,monospace",
            }}>✎</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(tx.id)} style={{
              background:`${C.red}15`, border:`1px solid ${C.red}40`,
              color:C.red, borderRadius:7, padding:"4px 8px",
              fontSize:11, cursor:"pointer", fontFamily:"DM Mono,monospace",
            }}>✕</button>
          )}
        </div>
      )}
    </div>
  </div>
);

// ─── ADD/EDIT MODAL ───────────────────────────────────────────────────────────
const TxModal = ({ tx, onSave, onClose }) => {
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
    onSave({ ...form, id: form.id || nextId++, amount: sign * Math.abs(parseFloat(form.amount)) });
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
          <div style={{ fontSize:17, fontWeight:700 }}>{form.id ? "Edytuj transakcję" : "Nowa transakcja"}</div>
          <button onClick={onClose} style={{ background:C.s2, border:`1px solid ${C.border}`, color:C.textSub, width:28, height:28, borderRadius:14, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Type toggle */}
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

        {/* Amount + currency row */}
        <div style={{ display:"flex", gap:10, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color: errors.amount ? C.red : C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>
              {errors.amount || "Kwota"}
            </div>
            <input value={form.amount} type="number" min="0" step="0.01"
              onChange={e=>set("amount",e.target.value)} placeholder="0.00"
              style={{ width:"100%", background:C.s2, border:`1px solid ${errors.amount?C.red:C.border}`, borderRadius:10, padding:"10px 14px", color:form.type==="expense"?C.red:C.accent, fontFamily:"DM Mono,monospace", fontSize:18, fontWeight:500, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <div style={{ width:90 }}>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>Waluta</div>
            <select value={form.currency} onChange={e=>set("currency",e.target.value)} style={{ width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"DM Mono,monospace", fontSize:14, outline:"none" }}>
              {CURRENCIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>Data</div>
          <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}
            style={{ width:"100%", background:C.s2, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"DM Mono,monospace", fontSize:14, outline:"none", boxSizing:"border-box", colorScheme:"dark" }}
          />
        </div>

        {/* Who */}
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

        {/* Category */}
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
          {form.id ? "Zapisz zmiany" : "Dodaj transakcję"}
        </button>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ txs, onEdit, onDelete, onAdd }) {
  const [filterPeriod, setFilterPeriod] = useState("this_month");
  const [filterWho, setFilterWho] = useState("Wszyscy");
  const [filterCat, setFilterCat] = useState("Wszystkie");
  const [page, setPage] = useState(0);
  const PAGE = 8;

  const filtered = useMemo(() => {
    const base = filterByRange(txs, filterPeriod);
    return base.filter(t => {
      if (filterWho !== "Wszyscy" && t.who !== filterWho) return false;
      if (filterCat !== "Wszystkie" && t.cat !== filterCat) return false;
      return true;
    });
  }, [txs, filterPeriod, filterWho, filterCat]);

  const income = filtered.filter(t=>t.amount>0).reduce((a,t)=>a+getPLNAmount(t),0);
  const expense = filtered.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance/income)*100) : 0;

  // Monthly trend (all data, no filter)
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

  // Category breakdown
  const catData = useMemo(() => {
    const map = {};
    filtered.filter(t=>t.amount<0).forEach(t => {
      if (!map[t.cat]) map[t.cat] = 0;
      map[t.cat] += Math.abs(getPLNAmount(t));
    });
    return Object.entries(map).map(([name,v])=>({ name, v, color:CAT_COLORS[name]||C.textSub }))
      .sort((a,b)=>b.v-a.v);
  }, [filtered]);

  // Person comparison
  const personData = useMemo(() => {
    const cats = [...new Set(filtered.filter(t=>t.amount<0).map(t=>t.cat))];
    return cats.map(cat => {
      const K = filtered.filter(t=>t.cat===cat&&t.who==="Kacper"&&t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
      const A = filtered.filter(t=>t.cat===cat&&t.who==="Anna"&&t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
      return { cat: cat.slice(0,8), K, A };
    });
  }, [filtered]);

  const paginated = filtered.slice(page*PAGE, (page+1)*PAGE);
  const totalPages = Math.ceil(filtered.length / PAGE);

  const resetFilters = () => { setFilterWho("Wszyscy"); setFilterCat("Wszystkie"); setPage(0); };

  return (
    <div style={{ padding:"20px 24px", maxWidth:1200, margin:"0 auto" }}>

      {/* ── FILTER BAR ── */}
      <Card style={{ marginBottom:16, padding:"14px 18px" }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>

          {/* Date range */}
          <div>
            <Label>Okres</Label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:C.text }}>
                {periodLabel(filterPeriod)}
              </span>
              <PeriodSelector
                value={filterPeriod}
                onChange={v=>{ setFilterPeriod(v); setPage(0); }}
              />
            </div>
          </div>

          <div style={{ width:1, height:40, background:C.border, flexShrink:0 }} />

          {/* Who */}
          <div>
            <Label>Osoba</Label>
            <div style={{ display:"flex", gap:6 }}>
              {["Wszyscy","Kacper","Anna"].map(w=>(
                <Chip key={w} label={w} active={w===filterWho}
                  color={w==="Kacper"?C.blue:w==="Anna"?C.purple:C.accent}
                  onClick={()=>{setFilterWho(w);setPage(0);}} />
              ))}
            </div>
          </div>

          <div style={{ width:1, height:40, background:C.border, flexShrink:0 }} />

          {/* Category */}
          <div style={{ flex:1, minWidth:200 }}>
            <Label>Kategoria</Label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Chip label="Wszystkie" active={filterCat==="Wszystkie"}
                onClick={()=>{setFilterCat("Wszystkie");setPage(0);}} />
              {CATS.map(c=>(
                <Chip key={c} label={c} active={c===filterCat}
                  color={CAT_COLORS[c]||C.textSub}
                  onClick={()=>{setFilterCat(c);setPage(0);}} />
              ))}
            </div>
          </div>

          {(filterWho!=="Wszyscy"||filterCat!=="Wszystkie") && (
            <button onClick={resetFilters} style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:C.red, background:`${C.red}15`, border:`1px solid ${C.red}40`, borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>
              Wyczyść
            </button>
          )}
        </div>
      </Card>

      {/* ── METRICS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
        {[
          { label:"Saldo okresu", val: (balance>=0?"+":"-")+fmt(balance), color:balance>=0?C.accent:C.red },
          { label:"Przychody", val:"+"+fmt(income), color:C.text },
          { label:"Wydatki", val:"−"+fmt(expense), color:C.red },
          { label:"Oszczędności", val:`${savingsRate}%`, color:C.yellow },
        ].map(m=>(
          <Card key={m.label} style={{ padding:"16px 18px" }}>
            <Label>{m.label}</Label>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:20, fontWeight:500, color:m.color }}>{m.val}</div>
          </Card>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:12 }}>
        <Card>
          <Label>Trendy miesięczne — przychody vs wydatki</Label>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trendData}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:11, fill:C.textSub }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:11, fill:C.textSub }} tickFormatter={v=>`${fmtShort(v)}k`} />
              <Tooltip contentStyle={tt} formatter={(v,n)=>[fmt(v), n==="inn"?"Przychód":"Wydatki"]} />
              <Line type="monotone" dataKey="inn" stroke={C.accent} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="out" stroke={C.red} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:16, marginTop:6 }}>
            {[{c:C.accent,l:"Przychody"},{c:C.red,l:"Wydatki"}].map(l=>(
              <span key={l.l} style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"DM Mono", fontSize:11, color:C.textSub }}>
                <span style={{ width:16, height:2, background:l.c, display:"inline-block", borderRadius:2 }} />{l.l}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <Label>Kategorie — wydatki</Label>
          {catData.length === 0
            ? <div style={{ color:C.muted, fontFamily:"DM Mono", fontSize:12, marginTop:20 }}>Brak wydatków w tym filtrze</div>
            : <>
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
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:7, fontFamily:"DM Mono", fontSize:11, color:C.textSub }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:c.color, display:"inline-block" }} />{c.name}
                    </span>
                    <span style={{ fontFamily:"DM Mono", fontSize:11, color:C.text }}>{fmt(c.v)}</span>
                  </div>
                ))}
              </div>
            </>
          }
        </Card>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Card>
          <Label>Kacper vs Anna — wydatki wg kategorii</Label>
          {personData.length === 0
            ? <div style={{ color:C.muted, fontFamily:"DM Mono", fontSize:12, marginTop:20 }}>Brak danych</div>
            : <ResponsiveContainer width="100%" height={180}>
              <BarChart data={personData} barSize={10} barCategoryGap="35%">
                <XAxis dataKey="cat" axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:10, fill:C.textSub }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontFamily:"DM Mono", fontSize:10, fill:C.textSub }} />
                <Tooltip contentStyle={tt} formatter={(v,n)=>[fmt(v), n==="K"?"Kacper":"Anna"]} />
                <Bar dataKey="K" fill={C.blue} radius={[3,3,0,0]} />
                <Bar dataKey="A" fill={C.purple} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          }
          <div style={{ display:"flex", gap:16, marginTop:8 }}>
            {[{c:C.blue,l:"Kacper"},{c:C.purple,l:"Anna"}].map(l=>(
              <span key={l.l} style={{ display:"flex", alignItems:"center", gap:7, fontFamily:"DM Mono", fontSize:11, color:C.textSub }}>
                <span style={{ width:8, height:8, borderRadius:2, background:l.c, display:"inline-block" }} />{l.l}
              </span>
            ))}
          </div>
        </Card>

        {/* ── TRANSACTION TABLE ── */}
        <Card style={{ display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <Label>Transakcje ({filtered.length})</Label>
            <button onClick={onAdd} style={{
              background:`${C.accent}18`, border:`1px solid ${C.accent}50`,
              color:C.accent, borderRadius:8, padding:"5px 12px",
              fontSize:11, fontFamily:"DM Mono,monospace", cursor:"pointer",
            }}>+ Dodaj</button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:7, flex:1 }}>
            {paginated.length === 0
              ? <div style={{ color:C.muted, fontFamily:"DM Mono", fontSize:12, marginTop:10 }}>Brak transakcji</div>
              : paginated.map(tx=>(
                <TxRow key={tx.id} tx={tx} compact
                  onEdit={onEdit} onDelete={onDelete} />
              ))
            }
          </div>

          {totalPages > 1 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
              <button disabled={page===0} onClick={()=>setPage(p=>p-1)} style={{
                background:page===0?C.s2:C.s3, border:`1px solid ${C.border}`,
                color:page===0?C.muted:C.text, borderRadius:8, padding:"5px 14px",
                fontFamily:"DM Mono,monospace", fontSize:11, cursor:page===0?"default":"pointer",
              }}>← Poprzednia</button>
              <span style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:C.textSub }}>
                {page+1} / {totalPages}
              </span>
              <button disabled={page===totalPages-1} onClick={()=>setPage(p=>p+1)} style={{
                background:page===totalPages-1?C.s2:C.s3, border:`1px solid ${C.border}`,
                color:page===totalPages-1?C.muted:C.text, borderRadius:8, padding:"5px 14px",
                fontFamily:"DM Mono,monospace", fontSize:11, cursor:page===totalPages-1?"default":"pointer",
              }}>Następna →</button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── PERIOD HELPERS ──────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0,10);
const CURRENT_MONTH_LABEL = (() => {
  const d = new Date();
  const months = ["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
})();

const PRESETS = [
  { key:"this_month",  label:"Ten miesiąc" },
  { key:"last_month",  label:"Ostatni miesiąc" },
  { key:"last_3",      label:"Ostatnie 3 miesiące" },
  { key:"this_year",   label:"Ten rok" },
  { key:"last_year",   label:"Ostatni rok" },
];

function getRange(period) {
  // period is either a preset key string, or { from, to } custom object
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

function filterByRange(txs, period) {
  const [from, to] = getRange(period);
  return txs.filter(t => t.date >= from && t.date <= to);
}

function periodLabel(period) {
  if (typeof period === "object") {
    const fmt = d => fmtDate(d);
    return `${fmt(period.from)} – ${fmt(period.to)}`;
  }
  return PRESETS.find(p=>p.key===period)?.label ?? period;
}

// ─── DATE RANGE PICKER POPUP ─────────────────────────────────────────────────
const DateRangePicker = ({ value, onChange, onClose, inline=false }) => {
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
      {/* Tab switcher */}
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
            Zastosuj zakres
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
};

// ─── PERIOD BUTTON (trigger) ──────────────────────────────────────────────────
const PeriodSelector = ({ value, onChange }) => {
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
};

// ─── TILE: SALDO CAŁKOWITE ────────────────────────────────────────────────────
const TileTotalBalance = ({ txs, defaultPeriod="this_month", theme=DARK }) => {
  const T2 = theme;
  const [period, setPeriod] = useState(defaultPeriod);
  const filtered = useMemo(()=>filterByRange(txs, period), [txs, period]);
  // cumulative = all txs up to end of period
  const [, to] = getRange(period);
  const cumulative = useMemo(()=>
    txs.filter(t=>t.date<=to).reduce((a,t)=>a+getPLNAmount(t),0)
  ,[txs, to]);
  const periodIncome = filtered.filter(t=>t.amount>0).reduce((a,t)=>a+getPLNAmount(t),0);
  const periodExpense = filtered.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);

  const isPos = cumulative >= 0;
  return (
    <div style={{ borderRadius:20, marginBottom:12, overflow:"hidden", border:`1px solid ${T2.border}` }}>
      {/* Gradient accent strip */}
      <div style={{ background:T2.accentGrad, padding:"14px 18px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:"rgba(255,255,255,0.75)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Saldo całkowite</div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:34, fontWeight:800, color:"#fff", marginTop:6, letterSpacing:"-1px" }}>
          {isPos?"+":"−"}{fmt(Math.abs(cumulative))}
        </div>
      </div>
      {/* Body */}
      <div style={{ background:T2.s1, padding:"14px 18px", display:"flex", gap:0 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T2.textSub, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Wpływy</div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, color:T2.accent }}>+{fmt(periodIncome)}</div>
        </div>
        <div style={{ width:1, background:T2.border, margin:"0 16px" }} />
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T2.textSub, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Wydatki</div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, color:T2.red }}>−{fmt(periodExpense)}</div>
        </div>
      </div>
    </div>
  );
};

// ─── TILE: PRZEPŁYWY PIENIĘŻNE ────────────────────────────────────────────────
const TileCashFlow = ({ txs, defaultPeriod="this_month", theme=DARK }) => {
  const T2 = theme;
  const [period, setPeriod] = useState(defaultPeriod);
  const filtered = useMemo(()=>filterByRange(txs, period), [txs, period]);
  const income  = filtered.filter(t=>t.amount>0).reduce((a,t)=>a+getPLNAmount(t),0);
  const expense = filtered.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
  const net     = income - expense;
  const savRate = income > 0 ? Math.round((net/income)*100) : 0;

  return (
    <div style={{ background:T2.s1, borderRadius:20, marginBottom:12, overflow:"hidden", border:`1px solid ${T2.border}` }}>
      {/* Accent top bar */}
      <div style={{ height:3, background: net>=0 ? T2.accentGrad : `linear-gradient(90deg,${T2.red},${T2.orange})` }} />
      <div style={{ padding:"14px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:T2.accentSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2.accent} strokeWidth="2.2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T2.text, fontWeight:600 }}>Przepływy</span>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:16 }}>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:28, fontWeight:800, color:net>=0?T2.accent:T2.red, letterSpacing:"-0.5px" }}>
            {net>=0?"+":"−"}{fmt(Math.abs(net))}
          </div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T2.textSub }}>netto</div>
        </div>
        {[
          { label:"Wpływy", val:income, color:T2.accent, sign:"+", pct:100 },
          { label:"Wydatki", val:expense, color:T2.red, sign:"−", pct: income>0?Math.min((expense/income)*100,100):0 },
        ].map(row=>(
          <div key={row.label} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:row.color }} />
                <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T2.textSub }}>{row.label}</span>
              </div>
              <span style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:600, color:row.color }}>{row.sign}{fmt(row.val)}</span>
            </div>
            <div style={{ background:T2.s2, borderRadius:6, height:6 }}>
              <div style={{ background:row.color, borderRadius:6, height:6, width:`${row.pct}%`, transition:"width .6s ease", opacity:0.85 }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${T2.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T2.textSub }}>Stopa oszczędności</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:40, height:6, borderRadius:3, background:T2.s2, overflow:"hidden" }}>
              <div style={{ width:`${Math.max(0,savRate)}%`, height:"100%", background:savRate>=30?T2.accent:savRate>=10?T2.yellow:T2.red, borderRadius:3 }} />
            </div>
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:savRate>=30?T2.accent:savRate>=10?T2.yellow:T2.red }}>{savRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TILE: WYDATKI WG KATEGORII ───────────────────────────────────────────────
const TileCategoryBreakdown = ({ txs, defaultPeriod="this_month", theme=DARK }) => {
  const T2 = theme;
  const [period, setPeriod] = useState(defaultPeriod);
  const filtered = useMemo(()=>filterByRange(txs, period), [txs, period]);
  const catData = useMemo(()=>{
    const map = {};
    filtered.filter(t=>t.amount<0).forEach(t=>{
      if(!map[t.cat]) map[t.cat]=0;
      map[t.cat]+=Math.abs(getPLNAmount(t));
    });
    const total = Object.values(map).reduce((a,v)=>a+v,0);
    return Object.entries(map)
      .map(([name,v])=>({ name, v, color:CAT_COLORS[name]||T2.dim, pct: total>0?Math.round((v/total)*100):0 }))
      .sort((a,b)=>b.v-a.v);
  },[filtered]);
  const totalExp = catData.reduce((a,c)=>a+c.v,0);

  return (
    <div style={{ background:T2.s1, borderRadius:20, marginBottom:12, border:`1px solid ${T2.border}`, overflow:"hidden" }}>
      <div style={{ padding:"14px 18px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`${T2.yellow}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2.yellow} strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T2.text, fontWeight:600 }}>Wydatki</span>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

      {catData.length === 0
        ? <div style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:T2.muted }}>Brak wydatków w tym okresie</div>
        : catData.map(c=>(
          <div key={c.name} style={{ marginBottom:11 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:c.color, display:"inline-block", flexShrink:0 }} />
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:T2.text }}>{c.name}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:c.color, background:`${c.color}18`, border:`1px solid ${c.color}40`, borderRadius:10, padding:"2px 7px" }}>
                  {c.pct}%
                </span>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:T2.text, minWidth:90, textAlign:"right" }}>{fmt(c.v)}</span>
              </div>
            </div>
            <div style={{ background:T2.s2, borderRadius:6, height:7 }}>
              <div style={{ background:c.color, borderRadius:6, height:7, width:`${c.pct}%`, transition:"width .6s ease" }} />
            </div>
          </div>
        ))
      }
      {catData.length > 0 && (
        <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${T2.border}`, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T2.textSub }}>Łącznie</span>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:T2.text }}>{fmt(totalExp)}</span>
        </div>
      )}
      </div>
    </div>
  );
};

// ─── TILE: PODZIAŁ KACPER VS ANNA ────────────────────────────────────────────
const TilePersonSplit = ({ txs, defaultPeriod="this_month", theme=DARK }) => {
  const T2 = theme;
  const [period, setPeriod] = useState(defaultPeriod);
  const filtered = useMemo(()=>filterByRange(txs, period), [txs, period]);
  const expense = filtered.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);

  const persons = ["Kacper","Anna"].map(who => {
    const total = filtered.filter(t=>t.who===who&&t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
    const pct   = expense > 0 ? Math.round((total/expense)*100) : 0;
    const cats  = {};
    filtered.filter(t=>t.who===who&&t.amount<0).forEach(t=>{
      if(!cats[t.cat]) cats[t.cat]=0;
      cats[t.cat]+=Math.abs(getPLNAmount(t));
    });
    const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
    return { who, total, pct, topCat };
  });

  return (
    <div style={{ background:T2.s1, borderRadius:20, marginBottom:12, border:`1px solid ${T2.border}`, overflow:"hidden" }}>
      <div style={{ padding:"14px 18px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`${T2.blue}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2.blue} strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T2.text, fontWeight:600 }}>Podział wydatków</span>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Split bar */}
        {expense > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", borderRadius:10, overflow:"hidden", height:12, marginBottom:8, gap:2 }}>
              <div style={{ background:T2.blue, width:`${persons[0].pct}%`, transition:"width .6s ease", borderRadius:10 }} />
              <div style={{ background:T2.purple, flex:1, borderRadius:10 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T2.blue }}>Kacper {persons[0].pct}%</span>
              <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T2.purple }}>Anna {persons[1].pct}%</span>
            </div>
          </div>
        )}

      {/* Per-person rows */}
      {persons.map(p=>(
        <div key={p.who} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, padding:"10px 12px", background:T2.s2, borderRadius:12, border:`1px solid ${T2.border}` }}>
          <Avatar who={p.who} size={34} />
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:3 }}>
              <span style={{ fontSize:13, fontWeight:600, color:T2.text }}>{p.who}</span>
              <span style={{ fontFamily:"DM Mono,monospace", fontSize:13, color:p.who==="Kacper"?T2.blue:T2.purple }}>{fmt(p.total)}</span>
            </div>
            {p.topCat && (
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:T2.dim }}>
                Najwięcej: <span style={{ color:CAT_COLORS[p.topCat[0]]||T2.dim }}>{p.topCat[0]}</span> · {fmt(p.topCat[1])}
              </div>
            )}
          </div>
        </div>
      ))}

      {expense === 0 && (
        <div style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:T2.muted }}>Brak wydatków w tym okresie</div>
      )}
      </div>
    </div>
  );
};

// ─── QUICK ACTIONS ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { desc:"Biedronka",  cat:"Jedzenie",   who:"Kacper", icon:"🛒" },
  { desc:"Lidl",       cat:"Jedzenie",   who:"Anna",   icon:"🛍" },
  { desc:"Paliwo",     cat:"Transport",  who:"Kacper", icon:"⛽" },
  { desc:"Apteka",     cat:"Zdrowie",    who:"Anna",   icon:"💊" },
  { desc:"Żabka",      cat:"Jedzenie",   who:"Anna",   icon:"🏪" },
  { desc:"Parking",    cat:"Transport",  who:"Kacper", icon:"🅿️" },
];

// ─── SWIPEABLE TX ROW ────────────────────────────────────────────────────────
const SwipeRow = ({ tx, onEdit, onDelete, theme }) => {
  const T = theme || DARK;
  const isIncome = tx.amount > 0;
  const catColor = CAT_COLORS[tx.cat] || T.accent;
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(null);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 40) setSwiped(true);
    if (diff < -20) setSwiped(false);
    startX.current = null;
  };
  // Also support mouse for desktop testing
  const mouseStart = useRef(null);
  const onMouseDown = (e) => { mouseStart.current = e.clientX; };
  const onMouseUp = (e) => {
    if (mouseStart.current === null) return;
    const diff = mouseStart.current - e.clientX;
    if (diff > 40) setSwiped(true);
    if (diff < -20) setSwiped(false);
    mouseStart.current = null;
  };

  return (
    <div style={{ position:"relative", marginBottom:8, borderRadius:16, overflow:"hidden" }}>
      {/* Action buttons revealed on swipe */}
      <div style={{
        position:"absolute", right:0, top:0, bottom:0,
        display:"flex", alignItems:"center", gap:6, padding:"0 10px",
        background: T.s2,
      }}>
        <button onClick={()=>{onEdit(tx);setSwiped(false);}} style={{
          background:T.s1, border:`1px solid ${T.border}`, color:T.textSub,
          width:44, height:44, borderRadius:12, cursor:"pointer", fontSize:15,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✎</button>
        <button onClick={()=>{onDelete(tx.id);setSwiped(false);}} style={{
          background:T.redSoft, border:`1px solid ${T.red}30`, color:T.red,
          width:44, height:44, borderRadius:12, cursor:"pointer", fontSize:15,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>
      </div>
      {/* Main row - slides left on swipe */}
      <div
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onClick={()=>{ if(swiped){ setSwiped(false); } }}
        style={{
          display:"flex", alignItems:"center",
          padding:"12px 14px", background:T.s1,
          border:`1px solid ${T.border}`, gap:12,
          boxShadow: T === LIGHT ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
          transform: swiped ? "translateX(-108px)" : "translateX(0)",
          transition:"transform .22s cubic-bezier(.4,0,.2,1)",
          cursor:"pointer", userSelect:"none",
          borderRadius:16,
          position:"relative", zIndex:1,
        }}>
        <div style={{
          width:42, height:42, borderRadius:14, flexShrink:0,
          background: isIncome ? "rgba(0,214,143,0.12)" : `${catColor}18`,
          border:`1.5px solid ${isIncome ? T.accent : catColor}30`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {isIncome ? <CatSVG name="Przychód" size={20} color={T.accent} /> : <CatSVG name={tx.cat} size={20} color={catColor} />}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, color:T.text, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"58%" }}>
              {tx.desc || tx.cat}
            </div>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, color:isIncome?T.accent:T.text, fontWeight:700, flexShrink:0 }}>
              {isIncome?"+":"−"}{fmt(tx.amount, tx.currency)}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>{tx.who}</span>
            <span style={{ width:3, height:3, borderRadius:"50%", background:T.muted, flexShrink:0 }} />
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>{tx.cat}</span>
            <span style={{ width:3, height:3, borderRadius:"50%", background:T.muted, flexShrink:0 }} />
            <span style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:T.secondary }}>{fmtDate(tx.date)}</span>
          </div>
        </div>
        {/* Swipe hint indicator */}
        {!swiped && (
          <div style={{ width:3, height:20, borderRadius:2, background:T.border, flexShrink:0, opacity:0.5 }} />
        )}
      </div>
    </div>
  );
};

// ─── SKELETON ROW ─────────────────────────────────────────────────────────────
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

// ─── SNACKBAR ────────────────────────────────────────────────────────────────
const Snackbar = ({ msg, onUndo, onClose, theme=DARK }) => {
  const Ts = theme;
  return (
    <div style={{
      position:"absolute", bottom:84, left:14, right:14, zIndex:500,
      background: Ts === LIGHT ? "#fff" : "#1e1e40",
      border:`1px solid ${Ts.border}`, borderRadius:14,
      padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
      boxShadow: Ts === LIGHT ? "0 8px 32px rgba(0,0,0,.15)" : "0 8px 32px rgba(0,0,0,.6)",
      animation:"slideUp .2s ease-out",
    }}>
      <span style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:Ts.text }}>{msg}</span>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <button onClick={onUndo} style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:Ts.accent, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Cofnij</button>
        <button onClick={onClose} style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:Ts.textSub, background:"none", border:"none", cursor:"pointer" }}>✕</button>
      </div>
    </div>
  );
};

// ─── MINI FORM ───────────────────────────────────────────────────────────────
// SVG icon renderer for categories - clean, professional, theme-aware
const CatSVG = ({ name, size=20, color="#888" }) => {
  const icons = {
    Jedzenie: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
    Transport: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    Mieszkanie: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Rozrywka: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>,
    Zdrowie: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    Subskrypcje: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    Przychód: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    Inne: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  };
  return icons[name] || <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>;
};

// Keep emoji fallback for icon picker in category manager
const CAT_ICONS = {
  Jedzenie:"🍽", Transport:"🚙", Mieszkanie:"🏡",
  Rozrywka:"🎬", Zdrowie:"❤️", Subskrypcje:"📦", Inne:"📎",
};

const RECUR_OPTIONS = [
  { key:"none",    label:"Jednorazowo" },
  { key:"daily",   label:"Codziennie" },
  { key:"weekly",  label:"Co tydzień" },
  { key:"monthly", label:"Co miesiąc" },
  { key:"yearly",  label:"Co rok" },
];

const MiniForm = ({ initial, onSave, onClose, availableCategories, theme }) => {
  const T = theme || DARK;
  const isEdit = !!initial?.id;

  // When editing, normalize: amount is always positive in the field, type set from sign
  const normalizedInitial = initial ? {
    ...initial,
    amount: initial.amount != null ? String(Math.abs(initial.amount)) : "",
    type: initial.amount != null ? (initial.amount >= 0 ? "income" : "expense") : (initial.type || "expense"),
  } : null;

  const [form, setForm] = useState(normalizedInitial || {
    desc:"", amount:"", cat:"Jedzenie", who:"Kacper",
    date:new Date().toISOString().slice(0,10),
    currency:"PLN", type:"expense", split:false, calcExpr:"",
    recurring:"none", recurEndDate:"", recurCount:"",
  });
  const [errors, setErrors]   = useState({});
  const [showCalc, setShowCalc]     = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCatPicker, setShowCatPicker]   = useState(false);

  // Use ref-based inputs to prevent focus loss on re-render
  const amountRef = useRef(null);
  const descRef   = useRef(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const haptic = () => { if (navigator.vibrate) navigator.vibrate([10,30,10]); };

  const handleSave = () => {
    const rawAmt = amountRef.current?.value || form.amount;
    const amt = String(rawAmt).replace(/^-+/, ""); // strip any leading minus
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
      setErrors({amount:true}); return;
    }
    haptic();
    const finalForm = { ...form, amount: amt, desc: descRef.current?.value || form.desc };
    const sign = finalForm.type === "expense" ? -1 : 1;
    const abs  = Math.abs(parseFloat(finalForm.amount));
    if (finalForm.split && finalForm.type === "expense") {
      onSave({ ...finalForm, id:nextId++, amount:parseFloat((sign*(abs/2)).toFixed(2)), who:"Kacper", split:false });
      onSave({ ...finalForm, id:nextId++, amount:parseFloat((sign*(abs/2)).toFixed(2)), who:"Anna",   split:false });
    } else {
      onSave({ ...finalForm, id:finalForm.id||nextId++, amount:sign*abs });
    }
  };

  const today     = new Date().toISOString().slice(0,10);
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  const dateLabel = form.date === today ? "Dziś" : form.date === yesterday ? "Wczoraj" : fmtDate(form.date);
  const typeColor = form.type === "expense" ? T.red : T.accent;

  // Use available categories passed from MobileApp (includes user-added ones)
  const cats = availableCategories || CATS;
  const catIcon = (c) => {
    const found = availableCategories?.find(cat=>cat.name===c);
    return found?.icon || CAT_ICONS[c] || "🏷";
  };
  const catColor = (c) => CAT_COLORS[c] || T.dim;

  const calcPress = (key) => {
    const expr = form.calcExpr || "";
    if (key === "C")  { set("calcExpr",""); if(amountRef.current) amountRef.current.value=""; return; }
    if (key === "⌫")  {
      const next = expr.slice(0,-1);
      set("calcExpr", next);
      if (!/[+\-×÷]/.test(next) && amountRef.current) amountRef.current.value = next;
      return;
    }
    if (key === "=") {
      try {
        const clean = expr.replace(/×/g,"*").replace(/÷/g,"/").replace(/\u2212/g,"-");
        const result = Function('"use strict";return ('+clean+')')();
        if (!isNaN(result) && result > 0) {
          const r = parseFloat(result.toFixed(2)).toString();
          // Update both the visible input AND form state so handleSave picks it up
          set("calcExpr","");
          set("amount", r);
          if (amountRef.current) amountRef.current.value = r;
          setShowCalc(false);
        }
      } catch {}
      return;
    }
    const next = expr + key;
    set("calcExpr", next);
    // If pure number (no operators), also update visible input
    if (!/[+\-×÷]/.test(next)) {
      if (amountRef.current) amountRef.current.value = next;
      set("amount", next);
    }
  };

  const F = ({ children, style={} }) => (
    <div style={{ marginBottom:12, ...style }}>{children}</div>
  );
  const FLabel = ({ children }) => (
    <div style={{ fontFamily:"DM Mono,monospace", fontSize:9, color:T.secondary, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:6 }}>{children}</div>
  );

  const recurLabel = RECUR_OPTIONS.find(o=>o.key===form.recurring)?.label || "Jednorazowo";

  return (
    <div>
      {/* ── Type toggle ── */}
      <F>
        <div style={{ display:"flex", background:T.s2, borderRadius:12, padding:3, border:`1px solid ${T.border}`, gap:3 }}>
          {[{k:"expense",l:"— Wydatek",c:T.red},{k:"income",l:"+ Przychód",c:T.accent}].map(t=>(
            <button key={t.k} onClick={()=>set("type",t.k)} style={{
              flex:1, padding:"10px", borderRadius:10, border:"none",
              background: form.type===t.k ? `${t.c}22` : "transparent",
              color: form.type===t.k ? t.c : T.muted,
              fontSize:13, fontWeight:700, fontFamily:"Outfit,sans-serif", cursor:"pointer",
            }}>{t.l}</button>
          ))}
        </div>
      </F>

      {/* ── Amount ── */}
      <F>
        <div style={{
          background:`${typeColor}0d`, border:`1.5px solid ${errors.amount ? T.red : typeColor}40`,
          borderRadius:16, padding:"12px 14px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"DM Mono,monospace", fontSize:20, color:typeColor, opacity:.7, flexShrink:0 }}>
              {form.type==="expense"?"−":"+"}
            </span>
            <input
              ref={amountRef}
              defaultValue={form.amount}
              inputMode="decimal"
              placeholder="0.00"
              onClick={(e)=>e.stopPropagation()}
              style={{
                flex:1, background:"transparent", border:"none",
                color: errors.amount ? T.red : typeColor,
                fontFamily:"DM Mono,monospace", fontSize:32, fontWeight:500, outline:"none",
                minWidth:0,
              }}
            />
            <select defaultValue={form.currency} onChange={e=>set("currency",e.target.value)}
              style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:8, padding:"5px 7px", color:T.text, fontFamily:"DM Mono,monospace", fontSize:11, outline:"none", flexShrink:0 }}>
              {CURRENCIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <button onClick={()=>setShowCalc(v=>!v)} style={{
              background: showCalc ? `${T.yellow}22` : T.s2,
              border:`1px solid ${showCalc ? T.yellow : T.border}`,
              color: showCalc ? T.yellow : T.dim,
              borderRadius:8, padding:"6px 9px", cursor:"pointer", fontSize:14, flexShrink:0,
            }}>🧮</button>
          </div>
          {errors.amount && <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:T.red, marginTop:4 }}>Podaj kwotę</div>}

          {/* 5. Expandable calculator */}
          {showCalc && (
            <div style={{ marginTop:10 }}>
              {form.calcExpr && (
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:T.dim, marginBottom:6, textAlign:"right" }}>{form.calcExpr}</div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                {[["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["C","0",".","="],["⌫","+","",""]].flat().map((k,i)=> k ? (
                  <button key={i} onClick={()=>calcPress(k)} style={{
                    height:38, borderRadius:9, border:`1px solid ${T.border}`,
                    background: k==="="?`${T.yellow}22`:["÷","×","−","+"].includes(k)?`${T.yellow}10`:k==="C"?`${T.red}12`:T.s2,
                    color: k==="="||["÷","×","−","+"].includes(k) ? T.yellow : k==="C" ? T.red : k==="⌫" ? T.muted : T.text,
                    fontFamily:"DM Mono,monospace", fontSize:14, cursor:"pointer",
                    gridColumn: k==="⌫" ? "1/3" : undefined,
                  }}>{k}</button>
                ) : <div key={i} />)}
              </div>
            </div>
          )}
        </div>
      </F>

      {/* ── Description ── */}
      <F>
        <FLabel>Opis</FLabel>
        <input ref={descRef} defaultValue={form.desc} placeholder="np. Biedronka"
          style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 14px", color:T.text, fontFamily:"DM Mono,monospace", fontSize:13, outline:"none", boxSizing:"border-box" }} />
      </F>

      {/* ── Category picker button ── */}
      <F>
        <FLabel>Kategoria</FLabel>
        <button onClick={()=>setShowCatPicker(true)} style={{
          width:"100%", display:"flex", alignItems:"center", gap:10,
          background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 14px",
          cursor:"pointer", textAlign:"left",
        }}>
          <CatSVG name={form.cat} size={20} color={T.accent} />
          <span style={{ fontSize:13, color:T.text, flex:1 }}>{form.cat}</span>
          <span style={{ color:T.secondary, fontSize:14 }}>›</span>
        </button>
      </F>

      {/* 8. Category modal using availableCategories */}
      {showCatPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(6,6,15,.88)", backdropFilter:"blur(6px)", zIndex:1000, display:"flex", alignItems:"flex-end" }}
          onClick={()=>setShowCatPicker(false)}>
          <div style={{ background:T.s1, borderRadius:"22px 22px 0 0", width:"100%", border:`1px solid ${T.border}`, borderBottom:"none", padding:"18px 18px 36px", maxHeight:"72%" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Wybierz kategorię</div>
              <button onClick={()=>setShowCatPicker(false)} style={{ background:T.s2, border:`1px solid ${T.border}`, color:T.dim, width:28, height:28, borderRadius:14, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ overflowY:"auto", maxHeight:"50vh" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {cats.map(c => {
                  const name = typeof c === "string" ? c : c.name;
                  const icon = typeof c === "string" ? (CAT_ICONS[c]||"🏷") : (c.icon||"🏷");
                  const color = CAT_COLORS[name] || T.dim;
                  return (
                    <button key={name} onClick={()=>{ set("cat",name); setShowCatPicker(false); }} style={{
                      padding:"10px 6px", borderRadius:14, cursor:"pointer",
                      border:`1px solid ${form.cat===name ? color : T.border}`,
                      background: form.cat===name ? `${color}20` : T.s1,
                      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    }}>
                      <CatSVG name={name} size={22} color={form.cat===name ? color : T.textSub} />
                      <span style={{ fontFamily:"DM Mono,monospace", fontSize:9, color: form.cat===name ? color : T.dim, textAlign:"center", lineHeight:1.2 }}>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Date row ── */}
      <F>
        <FLabel>Data</FLabel>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[{label:"Dziś",d:today},{label:"Wczoraj",d:yesterday}].map(({label,d})=>(
            <button key={label} onClick={()=>{ set("date",d); setShowDatePicker(false); }} style={{
              padding:"8px 16px", borderRadius:20, cursor:"pointer",
              border:`1px solid ${form.date===d&&!showDatePicker ? T.accent : T.border}`,
              background: form.date===d&&!showDatePicker ? `${T.accent}18` : T.s2,
              color: form.date===d&&!showDatePicker ? T.accent : T.dim,
              fontFamily:"DM Mono,monospace", fontSize:11,
            }}>{label}</button>
          ))}
          <button onClick={()=>setShowDatePicker(v=>!v)} style={{
            padding:"8px 14px", borderRadius:20, cursor:"pointer",
            border:`1px solid ${showDatePicker||(form.date!==today&&form.date!==yesterday) ? T.accent : T.border}`,
            background: showDatePicker||(form.date!==today&&form.date!==yesterday) ? `${T.accent}18` : T.s2,
            color: showDatePicker||(form.date!==today&&form.date!==yesterday) ? T.accent : T.dim,
            fontFamily:"DM Mono,monospace", fontSize:11,
          }}>{form.date!==today&&form.date!==yesterday ? dateLabel : "Wybierz datę"}</button>
        </div>
        {showDatePicker && (
          <input type="date" value={form.date}
            onChange={e=>{ set("date",e.target.value); setShowDatePicker(false); }}
            style={{ marginTop:8, width:"100%", background:T.s2, border:`1px solid ${T.accent}`, borderRadius:10, padding:"9px 14px", color:T.text, fontFamily:"DM Mono,monospace", fontSize:13, outline:"none", colorScheme:"dark", boxSizing:"border-box" }} />
        )}
      </F>

      {/* ── Who + Split (10: toggling 50/50 works both ways) ── */}
      <F>
        <FLabel>Kto wydaje</FLabel>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {["Kacper","Anna"].map(w=>(
            <button key={w} onClick={()=>{ if(form.split) set("split",false); set("who",w); }} style={{
              flex:1, padding:"9px", borderRadius:12, cursor:"pointer", transition:"all .12s",
              border:`1px solid ${form.who===w && !form.split ? (w==="Kacper"?T.blue:T.purple) : T.border}`,
              background: form.who===w && !form.split ? (w==="Kacper"?`${T.blue}20`:`${T.purple}20`) : T.s2,
              color: form.who===w && !form.split ? (w==="Kacper"?T.blue:T.purple) : T.dim,
              fontFamily:"DM Mono,monospace", fontSize:12,
            }}>
              {w==="Kacper"?"🔵":"🟣"} {w}
            </button>
          ))}
          {form.type === "expense" && (
            <button onClick={()=>set("split",!form.split)} style={{
              padding:"9px 12px", borderRadius:12, cursor:"pointer", transition:"all .12s",
              border:`1px solid ${form.split ? T.yellow : T.border}`,
              background: form.split ? `${T.yellow}18` : T.s2,
              color: form.split ? T.yellow : T.dim,
              fontFamily:"DM Mono,monospace", fontSize:11, whiteSpace:"nowrap",
            }}>
              {form.split ? "✓ 50/50" : "⚖ 50/50"}
            </button>
          )}
        </div>
        {form.split && <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:T.yellow, marginTop:6 }}>Podzielone po 50% — Kacper i Anna</div>}
      </F>

      {/* ── Opcje zaawansowane (Powtarzalność) ── */}
      <F>
        <button onClick={()=>setShowAdvanced(v=>!v)} style={{
          display:"flex", alignItems:"center", gap:8, width:"100%",
          background:"none", border:"none", cursor:"pointer", padding:"0 0 4px",
        }}>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>
            {showAdvanced ? "▾" : "▸"} Opcje zaawansowane
          </span>
          {form.recurring !== "none" && (
            <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.purple, background:`${T.purple}18`, padding:"2px 8px", borderRadius:10 }}>
              {RECUR_OPTIONS.find(o=>o.key===form.recurring)?.label}
            </span>
          )}
        </button>
        {showAdvanced && (
          <div style={{ background:T.s2, borderRadius:14, padding:"12px 14px", border:`1px solid ${T.border}`, marginTop:4 }}>
            <FLabel>Powtarzalność</FLabel>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:form.recurring!=="none"?10:0 }}>
              {RECUR_OPTIONS.map(o=>(
                <button key={o.key} onClick={()=>set("recurring",o.key)} style={{
                  padding:"7px 12px", borderRadius:20, cursor:"pointer",
                  border:`1px solid ${form.recurring===o.key ? T.purple : T.border}`,
                  background: form.recurring===o.key ? `${T.purple}20` : T.s1,
                  color: form.recurring===o.key ? T.purple : T.textSub,
                  fontFamily:"Outfit,sans-serif", fontSize:11,
                }}>{o.label}</button>
              ))}
            </div>
            {form.recurring !== "none" && (
              <div style={{ marginTop:8 }}>
                <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                  {[{k:"never",l:"Bez końca"},{k:"date",l:"Do daty"},{k:"count",l:"Po X razach"}].map(opt=>(
                    <button key={opt.k} onClick={()=>set("recurEnd",opt.k)} style={{
                      flex:1, padding:"6px 4px", borderRadius:10, cursor:"pointer",
                      border:`1px solid ${form.recurEnd===opt.k ? T.purple : T.border}`,
                      background: form.recurEnd===opt.k ? `${T.purple}20` : T.s1,
                      color: form.recurEnd===opt.k ? T.purple : T.textSub,
                      fontFamily:"Outfit,sans-serif", fontSize:11,
                    }}>{opt.l}</button>
                  ))}
                </div>
                {form.recurEnd === "date" && (
                  <input type="date" value={form.recurEndDate||""} onChange={e=>set("recurEndDate",e.target.value)} min={today}
                    style={{ width:"100%", background:T.s1, border:`1px solid ${T.purple}50`, borderRadius:9, padding:"8px 12px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:13, outline:"none", colorScheme:darkMode?"dark":"light", boxSizing:"border-box" }} />
                )}
                {form.recurEnd === "count" && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="number" min="1" max="999" value={form.recurCount||""} onChange={e=>set("recurCount",e.target.value)} placeholder="12"
                      style={{ width:70, background:T.s1, border:`1px solid ${T.purple}50`, borderRadius:9, padding:"8px 10px", color:T.purple, fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:700, outline:"none" }} />
                    <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>razy</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </F>

      {/* ── Save ── */}
      <button onClick={handleSave} style={{
        width:"100%", padding:"15px", background:typeColor, borderRadius:14, border:"none",
        color:"#06060f", fontSize:15, fontWeight:700, fontFamily:"Outfit,sans-serif", cursor:"pointer",
        marginTop:4,
      }}>
        {isEdit ? "Zapisz zmiany" : form.split ? "Dodaj — po 50% każde" : form.recurring!=="none" ? `Dodaj — ${recurLabel}` : "Dodaj transakcję"}
      </button>
    </div>
  );
};

// ─── SLIDE SCREEN ────────────────────────────────────────────────────────────
const SlideScreen = ({ show, children, zIndex=300, bg="#0f1117", color="#ECEEF4" }) => (
  <div style={{
    position:"absolute", inset:0, background:bg, color, zIndex,
    display:"flex", flexDirection:"column",
    transform: show ? "translateX(0)" : "translateX(100%)",
    transition:"transform .28s cubic-bezier(.4,0,.2,1)",
    pointerEvents: show ? "all" : "none",
  }}>
    {children}
  </div>
);

// ─── SETTINGS COMPONENTS ─────────────────────────────────────────────────────
const SettingsSection = ({ label, children, theme=DARK }) => {
  const T = theme;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}><div style={{ width:3, height:10, borderRadius:2, background:T.accentGrad }} /><div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div></div>
      <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        {children}
      </div>
    </div>
  );
};

const SRow = ({ icon, label, sub, right, danger, chevron, onClick, last, theme=DARK }) => {
  const T = theme;
  return (
    <div onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
      cursor: onClick ? "pointer" : "default",
      background: "transparent",
    }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, color: danger ? T.red : T.text, fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
      {chevron && <span style={{ color:T.secondary, fontSize:18, marginLeft:4 }}>›</span>}
    </div>
  );
};

const SSwitch = ({ on, onToggle, theme=DARK }) => {
  const T = theme;
  return (
    <div onClick={onToggle} style={{ width:46, height:26, borderRadius:13, flexShrink:0, background: on ? T.accent : T.s3, border:`1px solid ${on ? T.accent : T.border}`, position:"relative", transition:"background .2s", cursor:"pointer" }}>
      <div style={{ position:"absolute", top:3, left: on ? 22 : 3, width:18, height:18, borderRadius:9, background: on ? "#fff" : T.secondary, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </div>
  );
};

const SSelect = ({ options, value, onChange, theme=DARK }) => {
  const T = theme;
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      onClick={e=>e.stopPropagation()}
      style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:"6px 10px", color:T.accent, fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:600, outline:"none", cursor:"pointer", colorScheme: T === LIGHT ? "light" : "dark" }}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
};

// ─── MOBILE APP ──────────────────────────────────────────────────────────────
// ─── GOAL CARD ───────────────────────────────────────────────────────────────
const GoalCard = ({ g, theme, darkMode, goalSavedFn, goalPctFn, monthlyNeededFn, estimatedDoneFn, GOAL_TYPES, onPress }) => {
  const T = theme;
  const saved = goalSavedFn(g);
  const pct = goalPctFn(g);
  const mn = monthlyNeededFn(g);
  const isAchieved = g.status === "achieved";
  return (
    <button onClick={onPress} style={{
      width:"100%", background:T.s1, border:`1px solid ${T.border}`, borderRadius:20,
      padding:"16px", marginBottom:10, cursor:"pointer", textAlign:"left",
      boxShadow: darkMode ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{ width:40, height:40, borderRadius:14, background:`${g.color}20`, border:`1.5px solid ${g.color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ fontSize:18 }}>{GOAL_TYPES.find(t=>t.key===g.type)?.icon}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:700, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{g.name}</div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>
            {GOAL_TYPES.find(t=>t.key===g.type)?.label}
            {g.deadline && ` · do ${fmtDate(g.deadline)}`}
          </div>
        </div>
        {isAchieved && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, fontWeight:700, color:"#00E896", background:"rgba(0,232,150,0.15)", padding:"3px 8px", borderRadius:8, flexShrink:0 }}>✓ OSIĄGNIĘTY</div>}
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:g.color }}>{pct}%</div>
      </div>
      <div style={{ background:T.s2, borderRadius:6, height:8, marginBottom:10, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:6, background:isAchieved?`linear-gradient(90deg,#00E896,#00C9E0)`:g.color, width:`${pct}%`, transition:"width .5s ease" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <div>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, color:g.color }}>{fmt(saved)}</span>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}> / {fmt(g.target)}</span>
        </div>
        {mn && !isAchieved && (
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>
            {fmt(mn)}<span style={{color:T.secondary}}>/mies.</span>
          </div>
        )}
        {!mn && !isAchieved && estimatedDoneFn(g) && (
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>
            est. {fmtDate(estimatedDoneFn(g))}
          </div>
        )}
      </div>
    </button>
  );
};

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
// Simulates the full phone OTP + invite flow (Supabase + Twilio in production)
const DEMO_USERS = {
  "+48100000001": { name:"Kacper", household:"hh1", role:"owner" },
  "+48100000002": { name:"Anna",   household:null,  role:null  }, // nie ma jeszcze household
};

function AuthScreen({ onAuth, darkMode, setDarkMode }) {
  const T = darkMode ? DARK : LIGHT;
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [otpValues, setOtpValues] = useState(["","","","","",""]);
  // 6 stable refs for OTP boxes
  const r0=useRef(),r1=useRef(),r2=useRef(),r3=useRef(),r4=useRef(),r5=useRef();
  const otpRefs = [r0,r1,r2,r3,r4,r5];

  const DEMO_INVITE_CODE = "847291";
  const DEMO_OTP = "123456";

  const handlePhoneSubmit = () => {
    const clean = phone.replace(/\s/g,"");
    if (clean.length < 9) { setError("Podaj poprawny numer telefonu"); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 800);
  };

  const handleOtpChange = (i, e) => {
    // Accept paste of full code
    const raw = e.target.value.replace(/\D/g,"");
    if (raw.length > 1) {
      // Pasted full code
      const digits = raw.slice(0,6).split("");
      const next = [...otpValues];
      digits.forEach((d,j) => { if (j < 6) next[j] = d; });
      setOtpValues(next);
      setError("");
      const focusIdx = Math.min(digits.length, 5);
      otpRefs[focusIdx].current?.focus();
      return;
    }
    const v = raw.slice(0,1);
    const next = [...otpValues]; next[i] = v; setOtpValues(next);
    setError("");
    if (v && i < 5) {
      // Move to next immediately
      otpRefs[i+1].current?.focus();
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (otpValues[i]) {
        const next = [...otpValues]; next[i] = ""; setOtpValues(next);
      } else if (i > 0) {
        otpRefs[i-1].current?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      otpRefs[i-1].current?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      otpRefs[i+1].current?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const code = otpValues.join("");
    if (code !== DEMO_OTP) { setError(`Nieprawidłowy kod. Spróbuj: ${DEMO_OTP}`); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const clean = phone.replace(/\s/g,"");
      const user = DEMO_USERS[clean] || { name:"Nowy użytkownik", household:null, role:null };
      setResolvedUser(user);
      if (!user.household) setStep("join");
      else onAuth({ name:user.name, phone:clean, isOwner:user.role==="owner" });
    }, 700);
  };

  const handleJoinWithCode = () => {
    if (inviteCode.replace(/\s/g,"") !== DEMO_INVITE_CODE) {
      setError(`Nieprawidłowy kod. Demo: ${DEMO_INVITE_CODE}`); return;
    }
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuth({ name:resolvedUser?.name||"Nowy użytkownik", phone, isOwner:false, justJoined:true });
    }, 700);
  };

  const handleSkipInvite = () => {
    onAuth({ name:resolvedUser?.name||"Nowy użytkownik", phone, isOwner:true });
  };

  const inputStyle = (active) => ({
    width:"100%", padding:"14px 16px", borderRadius:14, boxSizing:"border-box",
    background:T.s2, border:`1.5px solid ${active ? T.accent : T.borderStrong}`, color:T.text,
    fontFamily:"Outfit,sans-serif", fontSize:16, outline:"none",
  });

  const BtnPrimary = ({ onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled||loading} style={{
      width:"100%", padding:"15px", borderRadius:16, border:"none",
      cursor: disabled||loading ? "default" : "pointer",
      background: disabled||loading ? T.s3 : T.accentGrad,
      color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:15,
      opacity: loading ? 0.7 : 1,
      boxShadow: !disabled && !loading ? `0 8px 24px ${T.accent}35` : "none",
    }}>{loading ? "Ładowanie..." : children}</button>
  );

  const BtnSecondary = ({ onClick, children }) => (
    <button onClick={onClick} style={{
      width:"100%", padding:"14px", borderRadius:16,
      border:`1.5px solid ${T.borderStrong}`, background:"transparent",
      color:T.textSub, fontFamily:"Outfit,sans-serif", fontWeight:500, fontSize:14, cursor:"pointer",
    }}>{children}</button>
  );

  const Logo = () => (
    <div style={{ marginBottom:32, textAlign:"center" }}>
      <div style={{ width:64, height:64, borderRadius:22, background:T.accentGrad, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:`0 10px 30px ${T.accent}40` }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:24, fontWeight:800, color:T.text, letterSpacing:"-0.5px" }}>HouseFinance</div>
      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginTop:4 }}>Twój domowy budżet</div>
    </div>
  );

  return (
    <div style={{ position:"absolute", inset:0, background:T.bg, display:"flex", flexDirection:"column", overflowY:"auto" }}>
      {/* Theme toggle */}
      <div style={{ position:"absolute", top:14, right:16, zIndex:10 }}>
        <SSwitch on={darkMode} onToggle={()=>setDarkMode(v=>!v)} theme={T} />
      </div>

      {/* ── STEP: PHONE ── */}
      {step === "phone" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px" }}>
          <Logo />
          <div style={{ width:"100%", marginBottom:12 }}>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginBottom:6 }}>Numer telefonu</div>
            <input value={phone} onChange={e=>{setPhone(e.target.value);setError("");}}
              placeholder="+48 600 700 800" type="tel" autoFocus
              onKeyDown={e=>e.key==="Enter"&&handlePhoneSubmit()}
              style={inputStyle(false)} />
          </div>
          {error && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.red, marginBottom:10, width:"100%" }}>{error}</div>}
          <BtnPrimary onClick={handlePhoneSubmit}>Wyślij kod SMS</BtnPrimary>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:14, textAlign:"center", lineHeight:1.5 }}>
            Demo: <strong style={{color:T.accent}}>+48 100 000 001</strong> (Kacper) lub <strong style={{color:T.accent}}>+48 100 000 002</strong> (Anna)
          </div>
        </div>
      )}

      {/* ── STEP: OTP ── */}
      {step === "otp" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px" }}>
          <Logo />
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:700, color:T.text, marginBottom:6, textAlign:"center" }}>Wpisz kod SMS</div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginBottom:24, textAlign:"center" }}>
            Wysłano na <strong style={{color:T.text}}>{phone}</strong>
          </div>
          {/* OTP boxes */}
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {otpValues.map((v,i) => (
              <input key={i} ref={otpRefs[i]} value={v} maxLength={6}
                inputMode="numeric" autoFocus={i===0}
                onChange={e=>handleOtpChange(i,e)}
                onKeyDown={e=>handleOtpKeyDown(i,e)}
                onFocus={e=>e.target.select()}
                style={{
                  width:44, height:52, textAlign:"center", fontSize:22, fontWeight:700,
                  borderRadius:12, border:`2px solid ${v ? T.accent : T.borderStrong}`,
                  background:T.s2, color:T.text, fontFamily:"Outfit,sans-serif", outline:"none",
                  caretColor: T.accent,
                }} />
            ))}
          </div>
          {error && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.red, marginBottom:10, textAlign:"center" }}>{error}</div>}
          <div style={{ width:"100%" }}>
            <BtnPrimary onClick={handleOtpSubmit} disabled={otpValues.join("").length < 6}>Zweryfikuj</BtnPrimary>
          </div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:12, textAlign:"center" }}>
            Demo — kod: <strong style={{color:T.accent}}>123456</strong>
          </div>
          <button onClick={()=>{setStep("phone");setOtpValues(["","","","","",""]);setError("");}}
            style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, background:"none", border:"none", marginTop:10, cursor:"pointer" }}>
            ← Zmień numer
          </button>
        </div>
      )}

      {/* ── STEP: JOIN ── */}
      {step === "join" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px" }}>
          <Logo />
          <div style={{ width:60, height:60, borderRadius:30, background:`${T.accent}18`, border:`2px solid ${T.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:700, color:T.text, marginBottom:6, textAlign:"center" }}>Masz kod zaproszenia?</div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginBottom:24, textAlign:"center", lineHeight:1.5 }}>
            Dołącz do istniejącego budżetu domowego, albo utwórz własne konto.
          </div>
          <div style={{ width:"100%", marginBottom:10 }}>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginBottom:6 }}>Kod zaproszenia (6 cyfr)</div>
            <input value={inviteCode} onChange={e=>{setInviteCode(e.target.value.replace(/\D/g,"").slice(0,6));setError("");}}
              placeholder="np. 847291" onKeyDown={e=>e.key==="Enter"&&handleJoinWithCode()}
              style={inputStyle(false)} />
          </div>
          {error && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.red, marginBottom:10 }}>{error}</div>}
          <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
            <BtnPrimary onClick={handleJoinWithCode} disabled={inviteCode.length < 6}>Dołącz do wspólnego konta</BtnPrimary>
            <BtnSecondary onClick={handleSkipInvite}>Utwórz nowe konto solo</BtnSecondary>
          </div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:12, textAlign:"center" }}>
            Demo — kod: <strong style={{color:T.accent}}>847291</strong>
          </div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:16, textAlign:"center", lineHeight:1.5, padding:"12px 0", borderTop:`1px solid ${T.border}`, width:"100%" }}>
            📲 Nie masz aplikacji? Pobierz ze sklepu, zarejestruj się swoim numerem i wpisz kod.
          </div>
        </div>
      )}
    </div>
  );
}

function MobileApp({ txs, onSave, onDelete, goals=[], onSaveGoal=()=>{}, onDeleteGoal=()=>{} }) {
  const [darkMode, setDarkMode] = useState(true);
  const T = darkMode ? DARK : LIGHT;
  // ── Auth state ──
  const [authUser, setAuthUser] = useState(null);
  const [justJoined, setJustJoined] = useState(false);
  // ── Main app state (hooks must be declared unconditionally) ──
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [quickPrefill, setQuickPrefill] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [showTxList, setShowTxList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);

  // ── Settings state ──
  const [sName1, setSName1] = useState("Kacper");
  const [sName2, setSName2] = useState("Anna");
  const [sEditingName, setSEditingName] = useState(null); // null | 1 | 2
  const [sCurrency, setSCurrency] = useState("PLN");
  const [sReminderOn, setSReminderOn] = useState(false);
  const [sReminderTime, setSReminderTime] = useState("21:00");
  const [sSummaryOn, setSSummaryOn] = useState(true);  const [sSummaryDay, setSSummaryDay] = useState("3");
  const [sDeleteConfirm, setSDeleteConfirm] = useState(false);
  const [sExported, setSExported] = useState(false);
  const [sQuickEdit, setSQuickEdit] = useState(false);
  const [sQuickActions, setSQuickActions] = useState([
    { desc:"Jedzenie", cat:"Jedzenie", icon:"", who:"Kacper" },
    { desc:"Transport", cat:"Transport", icon:"", who:"Kacper" },
    { desc:"Rozrywka",  cat:"Rozrywka",  icon:"", who:"Kacper" },
  ]);
  const [sCategories, setSCategories] = useState([
    ...CATS.map((name,i)=>({ id:i+1, name, icon:Object.values({Jedzenie:"🍕",Transport:"🚗",Mieszkanie:"🏠",Rozrywka:"🎮",Zdrowie:"💊",Subskrypcje:"📱",Inne:"🧾"})[i]||"🏷", system:true })),
  ]);
  const [sCatEditing, setSCatEditing] = useState(null);
  const [sCatAdding, setSCatAdding] = useState(false);
  const [sCatNewName, setSCatNewName] = useState("");
  const [sCatNewIcon, setSCatNewIcon] = useState("🏷");
  const [sCatIconPicker, setSCatIconPicker] = useState(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showQuickMgr, setShowQuickMgr] = useState(false);
  // ── Invite state ──
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteState, setInviteState] = useState("idle");

  const handleAuth = (user) => {
    if (user.justJoined) setJustJoined(true);
    setAuthUser(user);
    // Set display names from auth
    if (user.name) setSName1(user.name);
  };

  // ── Current month calculations ──
  const thisMonth = TODAY.slice(0,7);
  const monthTxs = txs.filter(t=>getMonthKey(t.date)===thisMonth);
  const income  = monthTxs.filter(t=>t.amount>0).reduce((a,t)=>a+getPLNAmount(t),0);
  const expense = monthTxs.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(getPLNAmount(t)),0);
  const balance = income - expense;

  const recent = [...txs].sort((a,b)=>b.date.localeCompare(a.date));

  const handleDelete = (id) => {
    const tx = txs.find(t=>t.id===id);
    if (!tx) return;
    onDelete(id);
    if (snackbar?.timer) clearTimeout(snackbar.timer);
    const timer = setTimeout(()=>setSnackbar(null), 4000);
    setSnackbar({ tx, timer });
  };

  const handleUndo = () => {
    if (!snackbar) return;
    clearTimeout(snackbar.timer);
    if (snackbar.tx) onSave(snackbar.tx);
    if (snackbar.goal) onSaveGoal(snackbar.goal);
    setSnackbar(null);
  };

  const handleGoalDelete = (goal) => {
    onDeleteGoal(goal.id);
    setGoalDetail(null);
    if (snackbar?.timer) clearTimeout(snackbar.timer);
    const timer = setTimeout(() => setSnackbar(null), 4000);
    setSnackbar({ goal, timer });
  };

  const handleQuickAction = (qa) => {
    setQuickPrefill({ ...qa, amount:"", currency:"PLN", type:"expense", split:false, date:new Date().toISOString().slice(0,10) });
    setEditTx(null);
    setShowAdd(true);
  };

  const openAdd = () => { setQuickPrefill(null); setEditTx(null); setShowAdd(true); };

  const grouped = useMemo(() => {
    const map = {};
    recent.forEach(tx => {
      const d = tx.date;
      if (!map[d]) map[d] = [];
      map[d].push(tx);
    });
    return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0]));
  }, [txs]);

  const allTxsSorted = recent;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.9} }
      @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      * { scrollbar-width: none; -ms-overflow-style: none; }
      *::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  const [showPlanned, setShowPlanned] = useState(false);

  // Reusable tab header with settings button (Fix 6)
  const TabHeader = ({ title, subtitle }) => (
    <div style={{ padding:"16px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", background:T.bg }}>
      <div>
        {subtitle && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, letterSpacing:"0.04em", marginBottom:2 }}>{subtitle}</div>}
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:20, fontWeight:700, color:T.text }}>{title}</div>
      </div>
      <button onClick={()=>setShowSettings(true)} style={{
        width:40, height:40, borderRadius:20, background:T.accentGrad,
        border:"none", display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", boxShadow:`0 4px 12px ${T.accent}35`, flexShrink:0,
        fontSize:15, fontWeight:700, color:"#fff",
        marginTop: subtitle ? 0 : 0,
      }}>{(authUser?.name || sName1).charAt(0).toUpperCase()}</button>
    </div>
  );

  // Fix 3: SVG-based nav icons (visible on both dark & light)
  const NavIcon = ({ type, active }) => {
    const color = active ? T.accent : T.textSub;
    const icons = {
      home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      planned: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="16" r="1.5" fill={color}/><circle cx="12" cy="16" r="1.5" fill={color}/><circle cx="16" cy="16" r="1.5" fill={color}/></svg>,
      goals: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill={color}/></svg>,
    };
    return icons[type] || null;
  };

  const tabs = [
    { key:"home",      navIcon:"home",      label:"Główna" },
    { key:"analytics", navIcon:"analytics", label:"Analityka" },
    { key:"planned",   navIcon:"planned",   label:"Planowane" },
    { key:"goals",     navIcon:"goals",     label:"Cele" },
  ];

  // ── HOME TAB JSX ──
  const homeTabJSX = (
    <div style={{ overflowY:"auto", height:"100%", background:T.bg }}>

      <TabHeader title={`Cześć, ${authUser?.name || sName1} 👋`} subtitle={CURRENT_MONTH_LABEL} />

      {/* Welcome banner for new members who just joined */}
      {justJoined && (
        <div style={{ margin:"0 20px 12px", padding:"14px 16px", borderRadius:16, background:`${T.accent}15`, border:`1px solid ${T.accent}40` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:700, color:T.accent, marginBottom:4 }}>
                🎉 Dołączyłeś/aś do wspólnego budżetu!
              </div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, lineHeight:1.5 }}>
                Wszystkie dotychczasowe transakcje są teraz widoczne dla obu użytkowników.
              </div>
            </div>
            <button onClick={()=>setJustJoined(false)} style={{ background:"none", border:"none", color:T.textSub, cursor:"pointer", fontSize:18, padding:"0 0 0 8px", flexShrink:0 }}>×</button>
          </div>
        </div>
      )}

      {/* ── BALANCE CARD ── */}
      {(() => {
        // Mini trend: last 3 months net
        const trendMonths = [-2,-1,0].map(offset => {
          const d = new Date(TODAY);
          d.setMonth(d.getMonth() + offset);
          const key = d.toISOString().slice(0,7);
          const mo = txs.filter(t=>getMonthKey(t.date)===key);
          const net = mo.reduce((a,t)=>a+getPLNAmount(t),0);
          const label = MONTHS[parseInt(key.slice(5,7))-1];
          return { key, net, label };
        });
        const maxAbs = Math.max(...trendMonths.map(m=>Math.abs(m.net)), 1);
        return (
          <div style={{ padding:"0 16px 16px" }}>
            <div style={{
              background: darkMode
                ? "linear-gradient(145deg,#072B1C 0%,#083050 60%,#0A1E38 100%)"
                : "linear-gradient(145deg,#007A52 0%,#005E8A 100%)",
              borderRadius:24, padding:"22px 20px 18px",
              boxShadow: darkMode
                ? `0 20px 60px rgba(0,232,150,0.15), 0 4px 20px rgba(0,0,0,0.5)`
                : `0 20px 60px rgba(0,120,80,0.35), 0 4px 16px rgba(0,0,0,0.12)`,
              position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", top:-30, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.6)", marginBottom:4, letterSpacing:"0.05em" }}>Saldo miesiąca</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:34, fontWeight:800, color:"#fff", marginBottom:16, letterSpacing:"-0.5px" }}>
                {balance>=0?"+":"−"}{fmt(Math.abs(balance))}
              </div>
              {/* Income / Expense row */}
              <div style={{ display:"flex", gap:0, marginBottom:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:3 }}>Wpływy</div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>+{fmt(income)}</div>
                </div>
                <div style={{ width:1, background:"rgba(255,255,255,0.12)", margin:"0 14px" }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:3 }}>Wydatki</div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>−{fmt(expense)}</div>
                </div>
              </div>
              {/* Mini 3-month trend bars */}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.12)", paddingTop:14 }}>
                <div style={{ fontFamily:"Outfit,sans-serif", fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.4)", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>Trend — 3 miesiące</div>
                <div style={{ display:"flex", gap:8 }}>
                  {trendMonths.map((m,i) => {
                    const barH = Math.max(8, Math.round((Math.abs(m.net)/maxAbs)*36));
                    const isCurrent = i === 2;
                    const isPos = m.net >= 0;
                    const barColor = isPos
                      ? (isCurrent ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.45)")
                      : (isCurrent ? "rgba(255,120,120,1)" : "rgba(255,120,120,0.45)");
                    const netStr = (isPos ? "+" : "−") + fmt(Math.abs(m.net));
                    return (
                      <div key={m.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                        {/* Net amount label above bar */}
                        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:9, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", whiteSpace:"nowrap" }}>
                          {netStr}
                        </div>
                        {/* Bar + bottom base */}
                        <div style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:40, gap:0 }}>
                          <div style={{ width:"100%", height:barH, borderRadius:"4px 4px 2px 2px", background:barColor, transition:"height .4s ease" }} />
                          <div style={{ width:"100%", height:2, background:"rgba(255,255,255,0.15)", borderRadius:1 }} />
                        </div>
                        {/* Month label */}
                        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:9, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>
                          {m.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ── QUICK ACTIONS ── */}
      <div style={{ padding:"0 20px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}><div style={{ width:4, height:14, borderRadius:2, background:T.accentGrad }} /><div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:T.text }}>Szybkie akcje</div></div>
        <div style={{ display:"flex", gap:10, overflowX:"auto" }}>
          {sQuickActions.map(qa=>(
            <button key={qa.cat} onClick={()=>handleQuickAction(qa)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:6,
              padding:"12px 14px", minWidth:68, borderRadius:18, flexShrink:0,
              background:T.s1, border:`1px solid ${T.border}`,
              cursor:"pointer", transition:"all .15s",
              boxShadow: darkMode ? `0 2px 12px ${T.accent}10` : "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                width:36, height:36, borderRadius:12,
                background:T.accentSoft,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
              }}><CatSVG name={qa.cat} size={20} color={T.accent} /></div>
              <span style={{ fontFamily:"Outfit,sans-serif", fontSize:10, fontWeight:500, color:T.textSub, whiteSpace:"nowrap" }}>{qa.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
      <div style={{ padding:"0 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}><div style={{ width:4, height:14, borderRadius:2, background:T.accentGrad }} /><div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:T.text }}>Ostatnie</div></div>
          <button onClick={()=>setShowTxList(true)} style={{
            fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:600, color:T.accent,
            background:"none", border:"none", cursor:"pointer",
          }}>Wszystkie →</button>
        </div>

        {grouped.slice(0,4).map(([date, dateTxs])=>{
          const yStr = new Date(new Date(TODAY).setDate(new Date(TODAY).getDate()-1)).toISOString().slice(0,10);
          const label = date===TODAY ? "Dziś" : date===yStr ? "Wczoraj" : fmtDate(date);
          return (
            <div key={date} style={{ marginBottom:14 }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
              {dateTxs.map(tx=>(
                <SwipeRow key={tx.id} tx={tx} theme={T}
                  onEdit={t=>{setEditTx(t);setQuickPrefill(null);setShowAdd(true);}}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          );
        })}

        {grouped.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 20px", animation:"fadeIn .4s ease" }}>
            <div style={{ fontSize:52, marginBottom:14 }}>💸</div>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:17, fontWeight:700, color:T.text, marginBottom:6 }}>Brak transakcji</div>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginBottom:24 }}>Zacznij od dodania pierwszego wydatku</div>
            <button onClick={openAdd} style={{
              padding:"13px 28px", background:T.accentGrad, border:"none", borderRadius:16,
              color:"#fff", fontWeight:700, fontSize:14, fontFamily:"Outfit,sans-serif", cursor:"pointer",
              boxShadow:`0 8px 24px ${T.accent}40`,
            }}>Dodaj transakcję</button>
          </div>
        )}

        <div style={{ height:24 }} />
      </div>
    </div>
  );

  // ── ANALYTICS TAB JSX ──
  const analyticsTabJSX = (
    <div style={{ overflowY:"auto", height:"100%", background:T.bg }}>
      <TabHeader title="Analityka" />
      <div style={{ padding:"0 20px" }}>
      {/* Accent line under header */}
      <TileTotalBalance txs={txs} theme={T} />
      <TileCashFlow txs={txs} theme={T} />
      <TileCategoryBreakdown txs={txs} theme={T} />
      <TilePersonSplit txs={txs} theme={T} />
      <div style={{ height:20 }} />
      </div>
    </div>
  );

  // ── GOALS HELPERS ──
  const goalSaved = (g) => g.deposits.reduce((a,d) => a + getPLNAmount({amount:d.amount, currency:d.currency}), 0);
  const goalPct = (g) => Math.min(100, Math.round((goalSaved(g) / g.target) * 100));

  const monthsLeft = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline), now = new Date(TODAY);
    return Math.max(0, (d.getFullYear()-now.getFullYear())*12 + d.getMonth()-now.getMonth());
  };

  const monthlyNeeded = (g) => {
    const ml = monthsLeft(g.deadline);
    if (!ml) return null;
    const remaining = Math.max(0, g.target - goalSaved(g));
    return ml > 0 ? Math.ceil(remaining / ml) : null;
  };

  const avgMonthlyDeposit = (g) => {
    if (g.deposits.length < 2) return null;
    const sorted = [...g.deposits].sort((a,b)=>a.date.localeCompare(b.date));
    const firstDate = new Date(sorted[0].date), lastDate = new Date(sorted[sorted.length-1].date);
    const months = Math.max(1, (lastDate.getFullYear()-firstDate.getFullYear())*12 + lastDate.getMonth()-firstDate.getMonth());
    return Math.round(goalSaved(g) / months);
  };

  const estimatedDone = (g) => {
    const avg = avgMonthlyDeposit(g);
    if (!avg || avg <= 0) return null;
    const remaining = Math.max(0, g.target - goalSaved(g));
    const months = Math.ceil(remaining / avg);
    const d = new Date(TODAY);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0,7);
  };

  // Goals tab state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalDetail, setGoalDetail] = useState(null); // goal id
  const [addDepositFor, setAddDepositFor] = useState(null); // goal id
  const [depositType, setDepositType] = useState('deposit'); // 'deposit' | 'withdrawal'

  // Reset deposit form whenever we open it for a new goal
  const openDepositForm = (goalId, type='deposit') => {
    setDepositAmount('');
    setDepositNote('');
    setDepositDate(TODAY);
    setDepositCurrency('PLN');
    setDepositType(type);
    setAddDepositFor(goalId);
  };
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositDate, setDepositDate] = useState(TODAY);
  const [depositCurrency, setDepositCurrency] = useState("PLN");
  const [newGoalForm, setNewGoalForm] = useState({ name:"", type:"savings", target:"", currency:"PLN", deadline:"", color:"#4CAEFF" });
  const [goalFormError, setGoalFormError] = useState("");

  const GOAL_COLORS = ["#4CAEFF","#00E896","#FFB547","#A78BFA","#FF6B8A","#FF8A47"];
  const GOAL_TYPES = [
    { key:"savings", label:"Oszczędności", icon:"🏦", desc:"Odkładasz na konkretny cel" },
    { key:"budget",  label:"Budżet",       icon:"🎯", desc:"Limit wydatków na projekt" },
    { key:"debt",    label:"Spłata",        icon:"📉", desc:"Redukcja długu lub pożyczki" },
  ];

  const handleAddDeposit = (goalId) => {
    const amt = parseFloat(depositAmount.replace(",","."));
    if (!amt || amt <= 0) return;
    const g = goals.find(g=>g.id===goalId);
    if (!g) return;
    const isWithdrawal = depositType === 'withdrawal';
    // Can't withdraw more than saved
    const savedNow = goalSaved(g);
    const amtPLN = getPLNAmount({amount:amt, currency:depositCurrency});
    if (isWithdrawal && amtPLN > savedNow) return;
    const newDep = {
      id: `d${nextDepositId++}`,
      amount: isWithdrawal ? -amt : amt,
      currency: depositCurrency,
      date: depositDate, note: depositNote,
      who: authUser?.name || sName1,
      kind: isWithdrawal ? 'withdrawal' : 'deposit',
    };
    const updated = { ...g, deposits:[...g.deposits, newDep] };
    // Check if goal achieved (only on deposit)
    if (!isWithdrawal && goalSaved(updated) >= updated.target && updated.status === "active") {
      updated.status = "achieved";
    }
    // Re-open goal if withdrawn below target
    if (isWithdrawal && updated.status === "achieved") {
      updated.status = "active";
    }
    onSaveGoal(updated);
    setAddDepositFor(null);
    setDepositType('deposit');
    setDepositAmount(""); setDepositNote(""); setDepositDate(TODAY); setDepositCurrency("PLN");
  };

  const handleSaveNewGoal = () => {
    if (!newGoalForm.name.trim()) { setGoalFormError("Podaj nazwę celu"); return; }
    const t = parseFloat(newGoalForm.target.replace(",","."));
    if (!t || t <= 0) { setGoalFormError("Podaj kwotę docelową"); return; }
    const g = {
      id: `g${nextGoalId++}`, name: newGoalForm.name.trim(),
      type: newGoalForm.type, target: t, currency: newGoalForm.currency,
      deadline: newGoalForm.deadline || null, createdAt: TODAY,
      status: "active", color: newGoalForm.color, deposits: [],
    };
    onSaveGoal(g);
    setShowAddGoal(false);
    setNewGoalForm({ name:"", type:"savings", target:"", currency:"PLN", deadline:"", color:"#4CAEFF" });
    setGoalFormError("");
  };

  const activeGoals = goals.filter(g=>g.status!=="archived");
  const achievedGoals = goals.filter(g=>g.status==="achieved");



  // Goal detail screen
  const activeGoal = goals.find(g=>g.id===goalDetail);

  const goalsTabJSX = (
    <div style={{ overflowY:"auto", height:"100%", background:T.bg }}>
      <TabHeader title="Cele" />
      <div style={{ padding:"0 20px" }}>

        {/* Summary row */}
        {activeGoals.length > 0 && (
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            <div style={{ flex:1, background:T.s1, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 14px" }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T.textSub, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Łącznie odłożone</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:800, color:T.accent }}>
                {fmt(activeGoals.reduce((a,g)=>a+goalSaved(g),0))}
              </div>
            </div>
            <div style={{ flex:1, background:T.s1, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 14px" }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T.textSub, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Aktywnych celów</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:800, color:T.blue }}>{activeGoals.filter(g=>g.status==="active").length}</div>
            </div>
          </div>
        )}

        {/* Active goals */}
        {activeGoals.filter(g=>g.status==="active").map(g=><GoalCard key={g.id} g={g} theme={T} darkMode={darkMode} goalSavedFn={goalSaved} goalPctFn={goalPct} monthlyNeededFn={monthlyNeeded} estimatedDoneFn={estimatedDone} GOAL_TYPES={GOAL_TYPES} onPress={()=>setGoalDetail(g.id)} />)}

        {/* Achieved */}
        {achievedGoals.length > 0 && (
          <>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:T.accent, textTransform:"uppercase", letterSpacing:"0.06em", margin:"8px 0 10px" }}>🏆 Osiągnięte</div>
            {achievedGoals.map(g=><GoalCard key={g.id} g={g} theme={T} darkMode={darkMode} goalSavedFn={goalSaved} goalPctFn={goalPct} monthlyNeededFn={monthlyNeeded} estimatedDoneFn={estimatedDone} GOAL_TYPES={GOAL_TYPES} onPress={()=>setGoalDetail(g.id)} />)}
          </>
        )}

        {/* Empty state */}
        {goals.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, color:T.text, marginBottom:6 }}>Brak celów</div>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.textSub, marginBottom:20 }}>Dodaj pierwszy cel oszczędnościowy lub budżet projektu</div>
          </div>
        )}

        <button onClick={()=>setShowAddGoal(true)} style={{
          width:"100%", padding:"14px", background:T.accentGrad, border:"none",
          borderRadius:16, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700,
          fontSize:14, cursor:"pointer", marginTop:4, marginBottom:20,
          boxShadow:`0 8px 24px ${T.accent}35`,
        }}>+ Nowy cel</button>
      </div>

      {/* ── GOAL DETAIL SCREEN ── */}
      <SlideScreen show={!!activeGoal} zIndex={300} bg={T.bg}>
        {activeGoal && (() => {
          const g = activeGoal;
          const saved = goalSaved(g);
          const pct = goalPct(g);
          const mn = monthlyNeeded(g);
          const avg = avgMonthlyDeposit(g);
          const est = estimatedDone(g);
          const isAchieved = g.status === "achieved";
          return (
            <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                <button onClick={()=>setGoalDetail(null)} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
                <div style={{ fontSize:15, fontWeight:700, color:T.text, flex:1 }}>{g.name}</div>
                <button onClick={()=>handleGoalDelete(g)} style={{ background:T.redSoft, border:"none", color:T.red, width:32, height:32, borderRadius:10, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>

                {/* Achieved banner */}
                {isAchieved && (
                  <div style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}40`, borderRadius:14, padding:"12px 16px", marginBottom:16, textAlign:"center" }}>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800, color:T.accent }}>🎉 Cel osiągnięty!</div>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginTop:4 }}>Gratulacje — odłożyłeś {fmt(saved)} z planowanych {fmt(g.target)}</div>
                  </div>
                )}

                {/* Big progress ring visual */}
                <div style={{ background:T.s1, borderRadius:20, border:`1px solid ${T.border}`, padding:"20px", marginBottom:12, textAlign:"center" }}>
                  <div style={{ position:"relative", display:"inline-block", marginBottom:12 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke={T.s2} strokeWidth="10"/>
                      <circle cx="60" cy="60" r="52" fill="none" stroke={g.color} strokeWidth="10"
                        strokeDasharray={`${Math.round(2*Math.PI*52*pct/100)} ${Math.round(2*Math.PI*52*(100-pct)/100)}`}
                        strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition:"stroke-dasharray .6s ease" }}/>
                    </svg>
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:22, fontWeight:800, color:T.text }}>{pct}%</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:20, fontWeight:800, color:g.color }}>{fmt(saved)}</div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>z {fmt(g.target)} {g.currency}</div>
                </div>

                {/* Stats row */}
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  {mn && !isAchieved && (
                    <div style={{ flex:1, background:T.s1, border:`1px solid ${T.border}`, borderRadius:14, padding:"10px 12px" }}>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T.textSub, marginBottom:4 }}>Potrzeba/mies.</div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.yellow }}>{fmt(mn)}</div>
                    </div>
                  )}
                  {avg && (
                    <div style={{ flex:1, background:T.s1, border:`1px solid ${T.border}`, borderRadius:14, padding:"10px 12px" }}>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T.textSub, marginBottom:4 }}>Śr. miesięcznie</div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.accent }}>{fmt(avg)}</div>
                    </div>
                  )}
                  {est && !isAchieved && (
                    <div style={{ flex:1, background:T.s1, border:`1px solid ${T.border}`, borderRadius:14, padding:"10px 12px" }}>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T.textSub, marginBottom:4 }}>Est. koniec</div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.blue }}>{fmtDate(est)}</div>
                    </div>
                  )}
                </div>

                {/* Add deposit */}
                {!isAchieved && (
                  addDepositFor === g.id ? (
                    <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:18, padding:"14px", marginBottom:12 }}>
                      {/* Deposit / Withdrawal toggle */}
                      <div style={{ display:"flex", background:T.s2, borderRadius:12, padding:3, marginBottom:14, gap:3 }}>
                        {[{k:"deposit",l:"Wpłata ↑",c:T.accent},{k:"withdrawal",l:"Wypłata ↓",c:T.red}].map(opt=>(
                          <button key={opt.k} onClick={()=>setDepositType(opt.k)} style={{
                            flex:1, padding:"9px", borderRadius:9, border:"none", cursor:"pointer",
                            background: depositType===opt.k ? T.s1 : "transparent",
                            color: depositType===opt.k ? opt.c : T.textSub,
                            fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight: depositType===opt.k ? 700 : 400,
                            boxShadow: depositType===opt.k ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                            transition:"all .15s",
                          }}>{opt.l}</button>
                        ))}
                      </div>
                      {depositType==="withdrawal" && (
                        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.red, background:T.redSoft, borderRadius:10, padding:"8px 12px", marginBottom:10 }}>
                          Dostępne do wypłaty: <strong>{fmt(goalSaved(g))}</strong>
                        </div>
                      )}
                      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                        <input value={depositAmount} onChange={e=>setDepositAmount(e.target.value)}
                          placeholder="0.00" inputMode="decimal"
                          style={{ flex:1, background:T.s2, border:`1px solid ${depositType==="withdrawal"?T.red:T.border}`, borderRadius:12, padding:"11px 14px", color:depositType==="withdrawal"?T.red:T.text, fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, outline:"none" }} />
                        <select value={depositCurrency} onChange={e=>setDepositCurrency(e.target.value)}
                          style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"8px 10px", color:T.accent, fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:700, outline:"none", colorScheme:darkMode?"dark":"light" }}>
                          {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <input value={depositNote} onChange={e=>setDepositNote(e.target.value)}
                        placeholder="Notatka (opcjonalnie)"
                        style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:10 }} />
                      <input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} max={TODAY}
                        style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:12, colorScheme:darkMode?"dark":"light" }} />
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>{setAddDepositFor(null);setDepositType("deposit");}} style={{ flex:1, padding:"11px", background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, color:T.textSub, fontFamily:"Outfit,sans-serif", fontSize:13, cursor:"pointer" }}>Anuluj</button>
                        <button onClick={()=>handleAddDeposit(g.id)} style={{ flex:2, padding:"11px", background:depositType==="withdrawal"?`linear-gradient(135deg,${T.red},${T.orange})`:T.accentGrad, border:"none", borderRadius:12, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 6px 16px ${depositType==="withdrawal"?T.red:T.accent}35` }}>
                          {depositType==="withdrawal"?"Wypłać":"Wpłać"} {depositAmount ? fmt(parseFloat(depositAmount.replace(",","."))||0) : ""}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                      <button onClick={()=>openDepositForm(g.id,'deposit')} style={{
                        flex:2, padding:"13px", background:T.accentGrad, border:"none",
                        borderRadius:16, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700,
                        fontSize:14, cursor:"pointer", boxShadow:`0 8px 20px ${T.accent}35`,
                      }}>+ Wpłata</button>
                      <button onClick={()=>openDepositForm(g.id,'withdrawal')} style={{
                        flex:1, padding:"13px", background:T.redSoft,
                        border:`1.5px solid ${T.red}40`, borderRadius:16, color:T.red,
                        fontFamily:"Outfit,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer",
                      }}>↓ Wypłata</button>
                    </div>
                  )
                )}

                {/* Deposits history */}
                {g.deposits.length > 0 && (
                  <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:18, overflow:"hidden", marginBottom:12 }}>
                    <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.border}`, fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:700, color:T.textSub }}>Historia wpłat ({g.deposits.length})</div>
                    {[...g.deposits].sort((a,b)=>b.date.localeCompare(a.date)).map((d,i,arr)=>(
                      <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                        <div style={{ width:34, height:34, borderRadius:10, background: d.amount<0 ? T.redSoft : `${g.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.amount<0?T.red:g.color} strokeWidth="2.2" strokeLinecap="round">
                            {d.amount<0 ? <polyline points="6 15 12 9 18 15"/> : <polyline points="6 9 12 15 18 9"/>}
                          </svg>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:600, color:T.text }}>{d.note || (d.amount<0?"Wypłata":"Wpłata")}</div>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>{d.who} · {fmtDate(d.date)}</div>
                        </div>
                        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:700, color: d.amount < 0 ? T.red : g.color }}>
                          {d.amount < 0 ? "−" : "+"}{fmt(Math.abs(d.amount), d.currency)}
                        </div>
                        <button onClick={()=>{
                          const updated = { ...g, deposits: g.deposits.filter(dep=>dep.id!==d.id) };
                          // If we're removing a deposit that pushed goal over target, revert status
                          if (g.status==="achieved" && goalSaved(updated) < updated.target) {
                            updated.status = "active";
                          }
                          onSaveGoal(updated);
                        }} style={{
                          width:28, height:28, borderRadius:8, flexShrink:0,
                          background:T.redSoft, border:`1px solid ${T.red}30`,
                          color:T.red, cursor:"pointer", fontSize:13,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </SlideScreen>

      {/* ── ADD GOAL SCREEN ── */}
      <SlideScreen show={showAddGoal} zIndex={300} bg={T.bg}>
        <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <button onClick={()=>setShowAddGoal(false)} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
            <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Nowy cel</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
            {/* Type selector */}
            <div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Typ celu</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {GOAL_TYPES.map(gt=>(
                  <button key={gt.key} onClick={()=>setNewGoalForm(f=>({...f,type:gt.key}))} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:14,
                    border:`1.5px solid ${newGoalForm.type===gt.key ? T.accent : T.border}`,
                    background: newGoalForm.type===gt.key ? T.accentSoft : T.s1,
                    cursor:"pointer", textAlign:"left",
                  }}>
                    <span style={{ fontSize:20 }}>{gt.icon}</span>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:600, color:T.text }}>{gt.label}</div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>{gt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Name */}
            <div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Nazwa</div>
              <input value={newGoalForm.name} onChange={e=>setNewGoalForm(f=>({...f,name:e.target.value}))}
                placeholder="np. Wakacje, Remont, Fundusz awaryjny"
                style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 14px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            {/* Target */}
            <div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Kwota docelowa</div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={newGoalForm.target} onChange={e=>setNewGoalForm(f=>({...f,target:e.target.value}))}
                  placeholder="0" inputMode="decimal"
                  style={{ flex:1, background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 14px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, outline:"none" }} />
                <select value={newGoalForm.currency} onChange={e=>setNewGoalForm(f=>({...f,currency:e.target.value}))}
                  style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"8px 10px", color:T.accent, fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, outline:"none", colorScheme:darkMode?"dark":"light" }}>
                  {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {/* Deadline */}
            <div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Termin (opcjonalny)</div>
              <input type="date" value={newGoalForm.deadline} onChange={e=>setNewGoalForm(f=>({...f,deadline:e.target.value}))} min={TODAY}
                style={{ width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 14px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:14, outline:"none", boxSizing:"border-box", colorScheme:darkMode?"dark":"light" }} />
            </div>
            {/* Color */}
            <div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Kolor</div>
              <div style={{ display:"flex", gap:8 }}>
                {GOAL_COLORS.map(c=>(
                  <button key={c} onClick={()=>setNewGoalForm(f=>({...f,color:c}))} style={{
                    width:32, height:32, borderRadius:10, background:c, border:`3px solid ${newGoalForm.color===c ? T.text : "transparent"}`, cursor:"pointer",
                  }} />
                ))}
              </div>
            </div>
            {goalFormError && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.red }}>{goalFormError}</div>}
            <button onClick={handleSaveNewGoal} style={{
              width:"100%", padding:"15px", background:T.accentGrad, border:"none",
              borderRadius:16, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:15,
              cursor:"pointer", marginTop:4, boxShadow:`0 8px 24px ${T.accent}35`,
            }}>Utwórz cel</button>
          </div>
        </div>
      </SlideScreen>
    </div>
  );

  // ── PLANNED TAB JSX ──
  const PlannedRow = ({ tx, accentColor, badgeContent }) => (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px" }}>
      <div style={{
        width:40, height:40, borderRadius:12, flexShrink:0,
        background:`${accentColor}15`, border:`1px solid ${accentColor}40`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {badgeContent}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:3 }}>
          <div style={{ fontSize:13, color:T.text, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"55%" }}>
            {tx.desc || tx.cat}
          </div>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:13, color:tx.amount>0?T.accent:T.text, fontWeight:600, flexShrink:0 }}>
            {tx.amount>0?"+":"−"}{fmt(tx.amount, tx.currency)}
          </div>
        </div>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>{tx.cat} · {tx.who}</div>
      </div>
    </div>
  );

  const plannedTabJSX = (
    <div style={{ overflowY:"auto", height:"100%", background:T.bg }}>
      <TabHeader title="Planowane" />
      <div style={{ padding:"0 20px" }}>

        {/* Recurring */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:T.purple, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>🔁 Powtarzające się</div>
          {txs.filter(t=>t.recurring && t.recurring!=="none").length === 0 ? (
            <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 16px", textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:8 }}>🔁</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:T.text, marginBottom:4 }}>Brak powtarzających się</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginBottom:16 }}>Ustaw powtarzalność przy dodawaniu transakcji</div>
              <button onClick={openAdd} style={{ padding:"10px 22px", background:T.accentGrad, border:"none", borderRadius:12, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:`0 6px 16px ${T.accent}35` }}>+ Nowa regularna</button>
            </div>
          ) : (
            <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:18, overflow:"hidden" }}>
              {txs.filter(t=>t.recurring && t.recurring!=="none").sort((a,b)=>b.date.localeCompare(a.date)).map((tx,i,arr)=>(
                <div key={tx.id} style={{ borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                  <PlannedRow tx={tx} accentColor={T.purple} badgeContent={<CatSVG name={tx.cat} size={20} color={T.purple} />} />
                  <div style={{ padding:"0 14px 10px 66px", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.purple }}>
                      🔁 {RECUR_OPTIONS.find(r=>r.key===tx.recurring)?.label}
                      {tx.recurEnd==="date" && tx.recurEndDate ? ` · do ${fmtDate(tx.recurEndDate)}` : ""}
                      {tx.recurEnd==="count" && tx.recurCount ? ` · ${tx.recurCount}×` : ""}
                    </span>
                    {(() => {
                      // Calculate next payment date based on recurring
                      const last = tx.date;
                      const d = new Date(last);
                      if (tx.recurring === "monthly") d.setMonth(d.getMonth()+1);
                      else if (tx.recurring === "weekly") d.setDate(d.getDate()+7);
                      else if (tx.recurring === "yearly") d.setFullYear(d.getFullYear()+1);
                      else if (tx.recurring === "daily") d.setDate(d.getDate()+1);
                      const next = d.toISOString().slice(0,10);
                      const isSoon = (new Date(next) - new Date(TODAY)) < 7*24*3600*1000;
                      return next > TODAY ? (
                        <span style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color: isSoon ? T.yellow : T.textSub, background: isSoon ? `${T.yellow}18` : T.s2, padding:"2px 8px", borderRadius:8 }}>
                          następna: {fmtDate(next)} {isSoon ? "⚡" : ""}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              ))}
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}` }}>
                <button onClick={openAdd} style={{ width:"100%", padding:"10px", background:T.accentSoft, border:`1px dashed ${T.accent}60`, borderRadius:12, color:T.accent, fontFamily:"Outfit,sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ Dodaj powtarzającą się</button>
              </div>
            </div>
          )}
        </div>

        {/* Planned future */}
        <div>
          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:T.yellow, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>⏰ Zaplanowane wpisy</div>
          {txs.filter(t=>t.date>TODAY).length === 0 ? (
            <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 16px", textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:8 }}>📅</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:T.text, marginBottom:4 }}>Brak zaplanowanych</div>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginBottom:16 }}>Dodaj wpis z datą w przyszłości</div>
              <button onClick={openAdd} style={{ padding:"10px 22px", background:T.accentGrad, border:"none", borderRadius:12, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:`0 6px 16px ${T.accent}35` }}>+ Zaplanuj wydatek</button>
            </div>
          ) : (
            <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:18, overflow:"hidden" }}>
              {txs.filter(t=>t.date>TODAY).sort((a,b)=>b.date.localeCompare(a.date)).map((tx,i,arr)=>(
                <div key={tx.id} style={{ borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                  <PlannedRow tx={tx} accentColor={T.yellow}
                    badgeContent={
                      <div style={{ fontFamily:"Outfit,sans-serif", color:T.yellow, textAlign:"center", lineHeight:1.1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.yellow }}>{tx.date.slice(8)}</div>
                        <div style={{ fontSize:9 }}>{tx.date.slice(5,7)}/{tx.date.slice(2,4)}</div>
                      </div>
                    } />
                </div>
              ))}
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}` }}>
                <button onClick={openAdd} style={{ width:"100%", padding:"10px", background:T.accentSoft, border:`1px dashed ${T.accent}60`, borderRadius:12, color:T.accent, fontFamily:"Outfit,sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ Zaplanuj nowy wpis</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ height:20 }} />
      </div>
    </div>
  );

  // ── AUTH GATE: show login screen if not authenticated ──
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
        }}>
          <AuthScreen onAuth={handleAuth} darkMode={darkMode} setDarkMode={setDarkMode} />
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
        boxShadow: darkMode
          ? "0 40px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,0.04)"
          : "0 40px 80px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,0.04)",
        fontFamily:"Outfit,sans-serif",
      }}>

        {/* Status bar */}
        <div style={{ height:44, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:T.bg }}>
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, fontWeight:600, color:T.textSub }}>9:41</span>
          <div style={{ width:72, height:18, background:T.bg, borderRadius:9, border:`1px solid ${T.border}` }} />
          <span style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>●●●</span>
        </div>

        {/* Content */}
        <div style={{ height:"calc(100% - 44px - 76px)", overflow:"hidden" }}>
          {tab==="home" ? homeTabJSX : tab==="analytics" ? analyticsTabJSX : tab==="planned" ? plannedTabJSX : goalsTabJSX}
        </div>

        {/* FAB — always on top */}
        <button onClick={openAdd} style={{
          position:"absolute", bottom:88, right:20, zIndex:150,
          width:54, height:54, borderRadius:18,
          background:T.accentGrad,
          border:"none", fontSize:26, color:"#fff", cursor:"pointer",
          boxShadow:`0 8px 28px ${T.accent}60`,
          display:"flex", alignItems:"center", justifyContent:"center", fontWeight:300,
          lineHeight:1,
        }}>+</button>

        {/* Snackbar */}
        {snackbar && <Snackbar
          msg={snackbar.goal ? `Cel "${snackbar.goal.name}" usunięty` : "Transakcja usunięta"}
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
          {tabs.map(t=>{
            const active = t.key === tab;
            return (
              <button key={t.key} onClick={()=>{ setTab(t.key); setShowAddGoal(false); setGoalDetail(null); setAddDepositFor(null); }} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                cursor:"pointer", background:"none", border:"none", padding:"4px 16px",
                borderRadius:14, transition:"all .15s",
              }}>
                <div style={{
                  width:36, height:28, borderRadius:10,
                  background: active ? T.accentSoft : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .2s",
                }}>
                  <NavIcon type={t.navIcon} active={active} />
                </div>
                <span style={{
                  fontFamily:"Outfit,sans-serif", fontSize:10, fontWeight:active?700:400,
                  color: active ? T.accent : T.textSub, transition:"color .15s",
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
        }} onClick={()=>{setShowAdd(false);setEditTx(null);setQuickPrefill(null);}}>
          <div style={{
            background:T.s1, borderRadius:"28px 28px 0 0", width:"100%",
            border:`1px solid ${T.border}`, borderBottom:"none",
            maxHeight:"92%", overflowY:"auto", boxSizing:"border-box",
            transform: showAdd ? "translateY(0)" : "translateY(100%)",
            transition:"transform .32s cubic-bezier(.4,0,.2,1)",
          }} onClick={e=>e.stopPropagation()}>
            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", paddingTop:10, paddingBottom:4 }}>
              <div style={{ width:36, height:4, borderRadius:2, background:T.border }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px 8px" }}>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:700, color:T.text }}>{editTx ? "Edytuj transakcję" : "Nowa transakcja"}</div>
              <button onClick={()=>{setShowAdd(false);setEditTx(null);setQuickPrefill(null);}} style={{
                background:T.s2, border:`1px solid ${T.border}`, color:T.textSub,
                width:30, height:30, borderRadius:15, cursor:"pointer", fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>✕</button>
            </div>
            <div style={{ padding:"0 20px 36px" }}>
              {showAdd && <MiniForm
                initial={editTx || quickPrefill}
                availableCategories={sCategories}
                theme={T}
                onSave={tx=>{
                  if (Array.isArray(tx)) tx.forEach(onSave);
                  else onSave(tx);
                  setShowAdd(false); setEditTx(null); setQuickPrefill(null);
                }}
                onClose={()=>{setShowAdd(false);setEditTx(null);setQuickPrefill(null);}}
              />}
            </div>
          </div>
        </div>

        {/* Settings screen */}
        <SlideScreen show={showSettings} zIndex={400} bg={T.bg} color={T.text}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <button onClick={()=>{ setShowSettings(false); setSDeleteConfirm(false); setSEditingName(null); }} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.text }}>Ustawienia</div>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>

              {/* ── PROFILE CARD on top ── */}
              <div style={{
                background: darkMode
                  ? "linear-gradient(135deg,#0D2B1C 0%,#0A1829 100%)"
                  : "linear-gradient(135deg,#E8F8F2 0%,#E8F2FB 100%)",
                border:`1px solid ${T.border}`, borderRadius:20,
                padding:"20px 16px 18px", marginBottom:20,
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:0 }}>
                  {[{n:sName1,setN:setSName1,id:1},{n:sName2,setN:setSName2,id:2}].map(({n,setN,id}, idx)=>(
                    <div key={id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
                      {/* Vertical divider between the two */}
                      {idx === 1 && (
                        <div style={{ position:"absolute", left:0, top:4, bottom:4, width:1, background:T.border }} />
                      )}
                      <div style={{
                        width:56, height:56, borderRadius:28,
                        background: id===1
                          ? `linear-gradient(135deg,#4CAEFF,#7C6FCD)`
                          : `linear-gradient(135deg,#A78BFA,#F472B6)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:22, fontWeight:700, color:"#fff",
                        boxShadow:`0 6px 16px rgba(0,0,0,0.2)`,
                        marginBottom:10,
                      }}>
                        {n.charAt(0).toUpperCase()}
                      </div>
                      {sEditingName===id ? (
                        <div style={{ display:"flex", gap:5, width:"90%" }}>
                          <input autoFocus value={n} onChange={e=>setN(e.target.value)}
                            style={{ flex:1, background:T.s2, border:`1px solid ${T.accent}`, borderRadius:8, padding:"6px 8px", color:T.text, fontFamily:"Outfit,sans-serif", fontSize:13, outline:"none", textAlign:"center" }} />
                          <button onClick={()=>setSEditingName(null)} style={{ background:T.accent, border:"none", borderRadius:8, padding:"6px 10px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>✓</button>
                        </div>
                      ) : (
                        <div onClick={()=>setSEditingName(id)} style={{ textAlign:"center", cursor:"pointer" }}>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:600, color:T.text, marginBottom:2 }}>{n}</div>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub }}>{id===1?"Właściciel":"Partner/ka"}</div>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:10, color:T.accent, marginTop:3 }}>✎ edytuj</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── WYGLĄD — theme switch prominent ── */}
              <SettingsSection label="Wygląd" theme={T}>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px" }}>
                  <span style={{ fontSize:18 }}>{darkMode ? "🌑" : "☀️"}</span>
                  <div style={{ flex:1, fontSize:13, color:T.text, fontWeight:500 }}>{darkMode ? "Ciemny motyw" : "Jasny motyw"}</div>
                  <SSwitch on={darkMode} onToggle={()=>setDarkMode(v=>!v)}  theme={T} />
                </div>
              </SettingsSection>

              {/* ── ZARZĄDZANIE ── */}
              <SettingsSection label="Zarządzanie" theme={T}>
                <SRow icon="🗂" label="Kategorie" sub={`${sCategories.length} kategorii`} chevron
                  onClick={()=>{ setShowCatManager(true); setSCatEditing(null); setSCatAdding(false); }} theme={T} />
                <SRow icon="⚡" label="Szybkie akcje" sub={`${sQuickActions.length} / 5 skrótów`} chevron last
                  onClick={()=>setShowQuickMgr(true)} theme={T} />
              </SettingsSection>

              {/* ── WALUTA ── */}
              <SettingsSection label="Waluta" theme={T}>
                <SRow icon="💱" label="Domyślna waluta" last={false}
                  right={<SSelect options={["PLN","EUR","USD","GBP"]} value={sCurrency} onChange={setSCurrency} theme={T} />} />
                <SRow icon="🌍" label="Kursy walut" sub="Statyczne — NBP API w produkcji" last
                  right={<span style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>EUR·USD·GBP</span>} theme={T} />
              </SettingsSection>

              {/* ── POWIADOMIENIA ── */}
              <SettingsSection label="Powiadomienia" theme={T}>
                <SRow icon="📅" label="Podsumowanie miesięczne" last={!sSummaryOn}
                  sub={sSummaryOn ? `${sSummaryDay}. dnia miesiąca` : "Wyłączone"}
                  right={<SSwitch on={sSummaryOn} onToggle={()=>setSSummaryOn(v=>!v)}  theme={T} />} />
                {sSummaryOn && (
                  <div style={{ padding:"8px 14px 12px 44px", borderTop:`1px solid ${T.border}` }}>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginBottom:6 }}>Dzień miesiąca</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {["1","2","3","5","7","10"].map(d=>(
                        <button key={d} onClick={()=>setSSummaryDay(d)} style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${sSummaryDay===d?T.accent:T.border}`, background:sSummaryDay===d?`${T.accent}18`:"transparent", color:sSummaryDay===d?T.accent:T.dim, fontFamily:"Outfit,sans-serif", fontSize:12, cursor:"pointer" }}>{d}.</button>
                      ))}
                    </div>
                  </div>
                )}
              </SettingsSection>

              {/* ── PARTNER / ZAPROSZENIE ── */}
              {(() => {
                const partnerJoined = !authUser?.isOwner || justJoined;
                return (
                  <SettingsSection label="Partner/ka" theme={T}>
                    {partnerJoined ? (
                      <SRow icon="👥" label={sName2} sub="Wspólne konto aktywne · wszystkie transakcje widoczne" last theme={T} />
                    ) : (
                      <>
                        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.border}` }}>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:T.text, fontWeight:500, marginBottom:8 }}>Zaproś partnera/kę</div>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginBottom:12, lineHeight:1.5 }}>
                            Wyślemy SMS z 6-cyfrowym kodem zaproszenia. Po dołączeniu wasza historia transakcji będzie widoczna dla obojga.
                          </div>
                          <input value={invitePhone} onChange={e=>setInvitePhone(e.target.value)}
                            placeholder="+48 600 700 800" type="tel"
                            style={{ width:"100%", padding:"11px 14px", borderRadius:12, boxSizing:"border-box", background:T.s2, border:`1.5px solid ${T.borderStrong}`, color:T.text, fontFamily:"Outfit,sans-serif", fontSize:14, outline:"none", marginBottom:10 }} />
                          <button onClick={()=>{
                            if (invitePhone.length < 9) return;
                            setInviteState("sent");
                            setTimeout(()=>setInviteState("idle"), 3000);
                          }} style={{
                            width:"100%", padding:"11px", background:T.accentGrad, border:"none",
                            borderRadius:12, color:"#fff", fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:14, cursor:"pointer",
                            boxShadow:`0 6px 16px ${T.accent}35`,
                          }}>
                            {inviteState === "sent" ? "✓ Wysłano SMS z kodem!" : "Wyślij zaproszenie SMS"}
                          </button>
                          {inviteState === "sent" && (
                            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.accent, marginTop:8, textAlign:"center" }}>
                              Kod zaproszenia: <strong>847 291</strong> · ważny 72h
                            </div>
                          )}
                        </div>
                        <div style={{ padding:"10px 14px" }}>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, lineHeight:1.5 }}>
                            📲 Partner/ka bez aplikacji? Może pobrać ją ze sklepu, zarejestrować się swoim numerem i wpisać kod zaproszenia.
                          </div>
                        </div>
                      </>
                    )}
                  </SettingsSection>
                );
              })()}

              <SettingsSection label="Dane" theme={T}>
                <SRow icon="📤" label="Eksport danych" sub={sExported?"✓ Skopiowano do schowka":"Backup transakcji (CSV)"} chevron
                  onClick={()=>{ setSExported(true); setTimeout(()=>setSExported(false),3000); }} theme={T} />
                {!sDeleteConfirm
                  ? <SRow icon="🗑" label="Usuń wszystkie dane" sub="Nieodwracalne" danger chevron last onClick={()=>setSDeleteConfirm(true)} theme={T} />
                  : <div style={{ padding:"12px 14px" }}>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.red, marginBottom:10 }}>Na pewno usunąć wszystkie transakcje?</div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>setSDeleteConfirm(false)} style={{ flex:1, padding:"8px", background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontFamily:"Outfit,sans-serif", fontSize:12, cursor:"pointer" }}>Anuluj</button>
                        <button onClick={()=>{ setSDeleteConfirm(false); setShowSettings(false); }} style={{ flex:1, padding:"8px", background:`${T.red}22`, border:`1px solid ${T.red}`, borderRadius:10, color:T.red, fontFamily:"Outfit,sans-serif", fontSize:12, cursor:"pointer", fontWeight:700 }}>Usuń</button>
                      </div>
                    </div>
                }
              </SettingsSection>

              {/* ── WYLOGUJ ── */}
              <button onClick={()=>{ setAuthUser(null); setShowSettings(false); }} style={{
                width:"100%", padding:"14px", background:"transparent",
                border:`1.5px solid ${T.red}50`, borderRadius:14, color:T.red,
                fontFamily:"Outfit,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer",
                marginBottom:8,
              }}>Wyloguj się</button>

              <div style={{ height:20 }} />
            </div>
          </SlideScreen>
        {/* Quick Actions manager screen */}
        <SlideScreen show={showQuickMgr} zIndex={450} bg={T.bg} color={T.text}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <button onClick={()=>setShowQuickMgr(false)} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.text }}>Szybkie akcje</div>
            <div style={{ marginLeft:"auto", fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>{sQuickActions.length} / 5</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub, marginBottom:14, lineHeight:1.5 }}>
              Wybierz do 5 kategorii jako szybkie skróty na ekranie głównym.
            </div>
            {/* 1. All categories from sCategories (including user-added) */}
            <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
              {sCategories.map((cat, i) => {
                const name = cat.name;
                const icon = cat.icon || CAT_ICONS[name] || "🏷";
                const color = CAT_COLORS[name] || T.dim;
                const activeIdx = sQuickActions.findIndex(q=>q.cat===name);
                const active = activeIdx !== -1;
                const disabled = !active && sQuickActions.length >= 5;
                return (
                  <div key={name}
                    onClick={()=>{
                      if (disabled) return;
                      if (active) setSQuickActions(a=>a.filter((_,j)=>j!==activeIdx));
                      else setSQuickActions(a=>[...a, { desc:name, cat:name, icon, who:"Kacper" }]);
                    }}
                    style={{
                      display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
                      borderBottom: i<sCategories.length-1 ? `1px solid ${T.border}` : "none",
                      cursor: disabled ? "default" : "pointer",
                      opacity: disabled ? 0.35 : 1,
                    }}>
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background: active ? `${color}20` : T.s2,
                      border:`1px solid ${active ? color : T.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                    }}>{icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color: active ? color : T.text, fontWeight: active ? 600 : 400 }}>{name}</div>
                      {cat.system && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.secondary }}>Wbudowana</div>}
                    </div>
                    <div style={{
                      width:24, height:24, borderRadius:12,
                      background: active ? color : T.s2,
                      border:`1px solid ${active ? color : T.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, color: active ? "#06060f" : T.muted,
                    }}>{active ? "✓" : ""}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ height:20 }} />
          </div>
        </SlideScreen>

        {/* Category manager screen */}
        {showCatManager && (() => {
          const ALL_ICONS = [
            "🛒","🍕","🍔","🌮","🍜","🍣","🍺","☕","🧃","🥗",
            "🚗","🚌","🚇","✈️","⛽","🅿️","🛵","🚲","🚕","🛳",
            "🏠","🏡","🛋","🔑","💡","🧹","🪣","🏗","🪟","🛏",
            "💊","🏥","🧘","🏋️","🩺","💉","🧬","🩻","🦷","👓",
            "🎮","🎬","🎵","🎸","📺","🎭","🎨","🎯","🎲","🎤",
            "👗","👟","👜","💄","🧴","🪒","💍","🕶","🧣","🎩",
            "📚","✏️","🖥","📱","⌚","🖨","🖱","📷","🎧","🔌",
            "💼","📊","📈","🤝","🏆","📋","🗂","📁","📝","🗓",
            "🐶","🐱","🌿","🌺","🌳","🪴","🌻","🐾","🌊","⭐",
            "🎁","🎂","🥳","💝","🎊","🪄","🎀","🎠","🧸","🪆",
            "💰","💳","🏦","📤","🧾","💸","🏷","🔖","📦","🪙",
          ];
          const groups = [
            { label:"Jedzenie & napoje", icons: ALL_ICONS.slice(0,10) },
            { label:"Transport",         icons: ALL_ICONS.slice(10,20) },
            { label:"Dom",               icons: ALL_ICONS.slice(20,30) },
            { label:"Zdrowie",           icons: ALL_ICONS.slice(30,40) },
            { label:"Rozrywka",          icons: ALL_ICONS.slice(40,50) },
            { label:"Ubrania & uroda",   icons: ALL_ICONS.slice(50,60) },
            { label:"Technologia",       icons: ALL_ICONS.slice(60,70) },
            { label:"Praca",             icons: ALL_ICONS.slice(70,80) },
            { label:"Natura & zwierzęta",icons: ALL_ICONS.slice(80,90) },
            { label:"Okazje",            icons: ALL_ICONS.slice(90,100) },
            { label:"Finanse",           icons: ALL_ICONS.slice(100) },
          ];

          return (
            <SlideScreen show={showCatManager} zIndex={500} bg={T.bg} color={T.text}>
              {/* Header */}
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                <button onClick={()=>{ setShowCatManager(false); setSCatEditing(null); setSCatAdding(false); setSCatIconPicker(null); }} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
                <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.text }}>Kategorie</div>
                <div style={{ marginLeft:"auto", fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>{sCategories.length} kategorii</div>
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>

                {/* ── ADD button on top ── */}
                {!sCatAdding ? (
                  <button onClick={()=>{ setSCatAdding(true); setSCatEditing(null); setSCatNewName(""); setSCatNewIcon("🏷"); setSCatIconPicker(null); }} style={{
                    width:"100%", padding:"12px", marginBottom:16, borderRadius:14,
                    border:`1px dashed ${T.accent}`, background:`${T.accent}10`,
                    color:T.accent, fontSize:13, fontFamily:"Outfit,sans-serif", fontWeight:700,
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}>
                    <span style={{ fontSize:18 }}>＋</span> Dodaj kategorię
                  </button>
                ) : (
                  <div style={{ background:T.s1, border:`1px solid ${T.accent}`, borderRadius:14, padding:"14px", marginBottom:16 }}>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Nowa kategoria</div>
                    <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                      <button onClick={()=>setSCatIconPicker(sCatIconPicker==="new"?null:"new")} style={{ width:44, height:44, borderRadius:12, border:`1px solid ${T.accent}`, background:T.s2, fontSize:22, cursor:"pointer", flexShrink:0 }}>{sCatNewIcon}</button>
                      <input autoFocus value={sCatNewName} onChange={e=>setSCatNewName(e.target.value)} placeholder="Nazwa kategorii"
                        style={{ flex:1, background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontFamily:"DM Mono,monospace", fontSize:13, outline:"none" }} />
                    </div>
                    {sCatIconPicker === "new" && (
                      <div style={{ marginBottom:12, background:T.s2, borderRadius:12, padding:10, maxHeight:200, overflowY:"auto" }}>
                        {groups.map(g=>(
                          <div key={g.label} style={{ marginBottom:8 }}>
                            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{g.label}</div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                              {g.icons.map(em=>(
                                <button key={em} onClick={()=>{ setSCatNewIcon(em); setSCatIconPicker(null); }} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${sCatNewIcon===em?T.accent:T.border}`, background:sCatNewIcon===em?`${T.accent}20`:"transparent", fontSize:18, cursor:"pointer" }}>{em}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>{ if(!sCatNewName.trim()) return; setSCategories([...sCategories,{id:Date.now(),name:sCatNewName.trim(),icon:sCatNewIcon,system:false}]); setSCatAdding(false); }} style={{ flex:1, padding:"10px", background:T.accent, border:"none", borderRadius:10, color:"#06060f", fontWeight:700, fontSize:13, fontFamily:"Outfit,sans-serif", cursor:"pointer" }}>Dodaj</button>
                      <button onClick={()=>setSCatAdding(false)} style={{ padding:"10px 14px", background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, color:T.dim, fontSize:12, fontFamily:"Outfit,sans-serif", cursor:"pointer" }}>Anuluj</button>
                    </div>
                  </div>
                )}

                {/* ── Category list ── */}
                <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
                  {sCategories.map((cat, i) => (
                    <div key={cat.id} style={{ borderBottom: i<sCategories.length-1 ? `1px solid ${T.border}` : "none" }}>
                      {sCatEditing === cat.id ? (
                        <div style={{ padding:"12px 14px" }}>
                          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                            <button onClick={()=>setSCatIconPicker(sCatIconPicker===cat.id?null:cat.id)} style={{ width:44, height:44, borderRadius:12, border:`1px solid ${T.accent}`, background:T.s2, fontSize:22, cursor:"pointer", flexShrink:0 }}>{cat.icon}</button>
                            <input value={cat.name} onChange={e=>{ const n=[...sCategories]; n[i]={...n[i],name:e.target.value}; setSCategories(n); }}
                              style={{ flex:1, background:T.s2, border:`1px solid ${T.accent}`, borderRadius:10, padding:"10px 12px", color:T.text, fontFamily:"DM Mono,monospace", fontSize:13, outline:"none" }} />
                          </div>
                          {sCatIconPicker === cat.id && (
                            <div style={{ marginBottom:10, background:T.s2, borderRadius:12, padding:10, maxHeight:200, overflowY:"auto" }}>
                              {groups.map(g=>(
                                <div key={g.label} style={{ marginBottom:8 }}>
                                  <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{g.label}</div>
                                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                                    {g.icons.map(em=>(
                                      <button key={em} onClick={()=>{ const n=[...sCategories]; n[i]={...n[i],icon:em}; setSCategories(n); setSCatIconPicker(null); }} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${cat.icon===em?T.accent:T.border}`, background:cat.icon===em?`${T.accent}20`:"transparent", fontSize:18, cursor:"pointer" }}>{em}</button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display:"flex", gap:8 }}>
                            <button onClick={()=>setSCatEditing(null)} style={{ flex:1, padding:"9px", background:T.accent, border:"none", borderRadius:10, color:"#06060f", fontWeight:700, fontSize:12, fontFamily:"Outfit,sans-serif", cursor:"pointer" }}>Zapisz</button>
                            {!cat.system && <button onClick={()=>{ setSCategories(sCategories.filter(c=>c.id!==cat.id)); setSCatEditing(null); }} style={{ padding:"9px 14px", background:`${T.red}15`, border:`1px solid ${T.red}40`, borderRadius:10, color:T.red, fontSize:12, fontFamily:"Outfit,sans-serif", cursor:"pointer" }}>Usuń</button>}
                            <button onClick={()=>setSCatEditing(null)} style={{ padding:"9px 12px", background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, color:T.dim, fontSize:12, fontFamily:"Outfit,sans-serif", cursor:"pointer" }}>✕</button>
                          </div>
                        </div>
                      ) : (
                        <div onClick={()=>{ setSCatEditing(cat.id); setSCatIconPicker(null); setSCatAdding(false); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", cursor:"pointer" }}>
                          <span style={{ fontSize:22, flexShrink:0 }}>{cat.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, color:T.text, fontWeight:500 }}>{cat.name}</div>
                            {cat.system && <div style={{ fontFamily:"Outfit,sans-serif", fontSize:12, color:T.secondary, marginTop:1 }}>Wbudowana</div>}
                          </div>
                          <span style={{ color:T.secondary, fontSize:14 }}>✎</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ height:20 }} />
              </div>
            </SlideScreen>
          );
        })()}
        <SlideScreen show={showTxList} zIndex={300} bg={T.bg} color={T.text}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <button onClick={()=>{ setShowTxList(false); setVisibleCount(20); }} style={{ background:T.s1, border:`1px solid ${T.border}`, color:T.text, width:32, height:32, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</button>
              <div style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700, color:T.text }}>Wszystkie transakcje</div>
              <div style={{ marginLeft:"auto", fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>{txs.length} wpisów</div>
            </div>
            <div
              style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}
              onScroll={e => {
                const el = e.target;
                if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
                  setVisibleCount(n => Math.min(n + 20, allTxsSorted.length));
                }
              }}
            >
              {/* Group by month with separators */}
              {(() => {
                const visible = allTxsSorted.slice(0, visibleCount);
                const items = [];
                let lastMonth = null;
                visible.forEach((tx, idx) => {
                  const mo = getMonthKey(tx.date);
                  if (mo !== lastMonth) {
                    lastMonth = mo;
                    const [y, m] = mo.split('-');
                    const monthName = `${MONTHS[parseInt(m)-1]} ${y}`;
                    items.push(
                      <div key={`sep-${mo}`} style={{
                        display:"flex", alignItems:"center", gap:10,
                        margin:"16px 0 8px", opacity:0.7,
                      }}>
                        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:T.accent, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{monthName}</div>
                        <div style={{ flex:1, height:1, background:T.border }} />
                      </div>
                    );
                  }
                  items.push(
                    <SwipeRow key={tx.id} tx={tx} theme={T}
                      onEdit={t=>{setEditTx(t);setQuickPrefill(null);setShowTxList(false);setShowAdd(true);}}
                      onDelete={handleDelete}
                    />
                  );
                });
                return items;
              })()}
              {visibleCount < allTxsSorted.length && (
                <div style={{ textAlign:"center", padding:"14px 0", fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>
                  ↓ przewiń aby załadować więcej ({allTxsSorted.length - visibleCount} pozostało)
                </div>
              )}
              {visibleCount >= allTxsSorted.length && allTxsSorted.length > 20 && (
                <div style={{ textAlign:"center", padding:"14px 0", fontFamily:"Outfit,sans-serif", fontSize:12, color:T.textSub }}>
                  — koniec listy —
                </div>
              )}
              <div style={{ height:8 }} />
            </div>
        </SlideScreen>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [txs, setTxs] = useState(seedTx);
  const [goals, setGoals] = useState(seedGoals);
  const [modal, setModal] = useState(null); // null | "add" | tx object

  const handleSaveGoal = (goal) => {
    setGoals(prev => prev.some(g=>g.id===goal.id)
      ? prev.map(g=>g.id===goal.id?goal:g)
      : [...prev, goal]
    );
  };
  const handleDeleteGoal = (id) => setGoals(prev=>prev.filter(g=>g.id!==id));

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap";
    link.rel="stylesheet";
    document.head.appendChild(link);
    return ()=>{ if(document.head.contains(link)) document.head.removeChild(link); };
  },[]);

  const handleSave = (txOrArray) => {
    const items = Array.isArray(txOrArray) ? txOrArray : [txOrArray];
    setTxs(prev => {
      let next = [...prev];
      items.forEach(tx => {
        next = next.some(t=>t.id===tx.id)
          ? next.map(t=>t.id===tx.id?tx:t)
          : [...next, tx];
      });
      return next;
    });
    setModal(null);
  };

  const handleDelete = (id) => setTxs(prev=>prev.filter(t=>t.id!==id));

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"Outfit,sans-serif" }}>
      <header style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:`${C.bg}ee`, backdropFilter:"blur(12px)", zIndex:100 }}>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:13, color:C.accent, letterSpacing:"0.22em", textTransform:"uppercase" }}>HouseFinance</div>
        <div style={{ display:"flex", gap:6, background:C.s1, borderRadius:10, padding:4, border:`1px solid ${C.border}` }}>
          {[{k:"dashboard",l:"🖥  Dashboard"},{k:"mobile",l:"📱  Mobile"}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{ padding:"8px 16px", borderRadius:7, border:"none", background:view===v.k?C.accent:"transparent", color:view===v.k?"#06060f":C.muted, fontSize:13, fontFamily:"Outfit,sans-serif", fontWeight:700, cursor:"pointer", transition:"all .15s" }}>{v.l}</button>
          ))}
        </div>
        <div style={{ fontFamily:"Outfit,sans-serif", fontSize:11, color:C.textSub }}>{CURRENT_MONTH_LABEL}</div>
      </header>

      {view==="dashboard"
        ? <Dashboard txs={txs} onEdit={setModal} onDelete={handleDelete} onAdd={()=>setModal("add")} />
        : <MobileApp txs={txs} onSave={handleSave} onDelete={handleDelete} goals={goals} onSaveGoal={handleSaveGoal} onDeleteGoal={handleDeleteGoal} />
      }

      {/* Global modal for dashboard */}
      {modal && view==="dashboard" && (
        <TxModal
          tx={modal==="add" ? null : modal}
          onSave={handleSave}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
