import { DARK } from './theme';

const C = DARK;

export const MONTHS = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Pa\u017a","Lis","Gru"];
export const CATS = ["Jedzenie","Transport","Mieszkanie","Rozrywka","Zdrowie","Subskrypcje","Inne"];
export const CAT_COLORS = {
  Jedzenie: C.yellow, Transport: C.blue, Mieszkanie: C.accent,
  Rozrywka: C.red, Zdrowie: "#4ade80", Subskrypcje: C.purple, Inne: C.textSub,
};
export const CURRENCIES = ["PLN","EUR","USD","GBP"];

export const CAT_ICONS = {
  Jedzenie:"\uD83C\uDF7D", Transport:"\uD83D\uDE99", Mieszkanie:"\uD83C\uDFE1",
  Rozrywka:"\uD83C\uDFAC", Zdrowie:"\u2764\uFE0F", Subskrypcje:"\uD83D\uDCE6", Inne:"\uD83D\uDCCE",
};

export const RECUR_OPTIONS = [
  { key:"none",    label:"Jednorazowo" },
  { key:"daily",   label:"Codziennie" },
  { key:"weekly",  label:"Co tydzień" },
  { key:"monthly", label:"Co miesiąc" },
  { key:"yearly",  label:"Co rok" },
];

export const GOAL_TYPES = [
  { key:"savings", label:"Oszczędności", icon:"🏦", desc:"Odkładasz na konkretny cel" },
  { key:"budget",  label:"Budżet",       icon:"🎯", desc:"Limit wydatków na projekt" },
  { key:"debt",    label:"Spłata",        icon:"📉", desc:"Redukcja długu lub pożyczki" },
];

export const GOAL_COLORS = ["#4CAEFF","#00E896","#FFB547","#A78BFA","#FF6B8A","#FF8A47"];

export const QUICK_ACTIONS = [
  { desc:"Biedronka",  cat:"Jedzenie",   who:"Kacper", icon:"🛒" },
  { desc:"Lidl",       cat:"Jedzenie",   who:"Anna",   icon:"🛍" },
  { desc:"Paliwo",     cat:"Transport",  who:"Kacper", icon:"⛽" },
  { desc:"Apteka",     cat:"Zdrowie",    who:"Anna",   icon:"💊" },
  { desc:"Żabka",      cat:"Jedzenie",   who:"Anna",   icon:"🏪" },
  { desc:"Parking",    cat:"Transport",  who:"Kacper", icon:"🅿️" },
];

export const DEMO_USERS = {
  "+48100000001": { name:"Kacper", household:"hh1", role:"owner" },
  "+48100000002": { name:"Anna",   household:null,  role:null  },
};
