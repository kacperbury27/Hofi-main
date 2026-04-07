export const seedGoals = [
  {
    id:"g1", name:"Wakacje w Japonii", type:"savings",
    target:12000, currency:"PLN", deadline:"2026-09-01",
    createdAt:"2025-10-01", status:"active",
    color:"#4CAEFF",
    deposits:[
      { id:"d1", amount:500, currency:"PLN", date:"2025-10-25", note:"Pierwsza wp\u0142ata", who:"Kacper" },
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
      { id:"d21", amount:2500, currency:"PLN", date:"2026-02-20", note:"Materia\u0142y", who:"Kacper" },
    ],
  },
  {
    id:"g4", name:"Nowe auto \u2014 wk\u0142ad w\u0142asny", type:"savings",
    target:20000, currency:"PLN", deadline:"2027-06-01",
    createdAt:"2026-02-01", status:"active",
    color:"#A78BFA",
    deposits:[
      { id:"d30", amount:1000, currency:"PLN", date:"2026-02-25", note:"", who:"Kacper" },
      { id:"d31", amount:1000, currency:"PLN", date:"2026-03-25", note:"", who:"Kacper" },
    ],
  },
];
export let nextGoalId = 5;
export let nextDepositId = 40;
