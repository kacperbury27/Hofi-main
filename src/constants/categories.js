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
  { key:"weekly",  label:"Co tydzie\u0144" },
  { key:"monthly", label:"Co miesi\u0105c" },
  { key:"yearly",  label:"Co rok" },
];
