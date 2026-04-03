export const DARK = {
  bg: "#0C0E14", s1: "#13161E", s2: "#1A1E28", s3: "#252A38",
  border: "rgba(255,255,255,0.09)", borderStrong: "rgba(255,255,255,0.16)",
  accent: "#00E896", accentSoft: "rgba(0,232,150,0.14)",
  accentGrad: "linear-gradient(135deg,#00E896 0%,#00C9E0 100%)",
  red: "#FF6B8A", redSoft: "rgba(255,107,138,0.13)",
  blue: "#4CAEFF", yellow: "#FFB547", purple: "#B09BFF", orange:"#FF8A47",
  text: "#ECEEF4",
  textSub: "#9AA5B4",
  secondary: "#6E7D91",
  muted: "#4A5668",
  dim: "#7A8A9C",
  card: "rgba(19,22,30,0.97)", glass: "rgba(255,255,255,0.04)",
};

export const LIGHT = {
  bg: "#F4F6FA", s1: "#FFFFFF", s2: "#EDF0F7", s3: "#E2E7F0",
  border: "rgba(0,0,0,0.07)", borderStrong: "rgba(0,0,0,0.13)",
  accent: "#00A36B", accentSoft: "rgba(0,163,107,0.10)",
  accentGrad: "linear-gradient(135deg,#00A36B 0%,#0091B8 100%)",
  red: "#D93454", redSoft: "rgba(217,52,84,0.10)",
  blue: "#1E7DE6", yellow: "#D97706", purple: "#6D56C8", orange:"#E0621A",
  text: "#0D1117",
  textSub: "#374151",
  secondary: "#6B7280",
  muted: "#9CA3AF",
  dim: "#6B7280",
  card: "#FFFFFF", glass: "rgba(0,0,0,0.02)",
};

export const makeTT = (theme) => ({
  backgroundColor: theme.s2,
  border: `1px solid ${theme.borderStrong}`,
  color: theme.text, fontFamily: "Outfit,sans-serif",
  fontSize: 12, borderRadius: 8,
});
