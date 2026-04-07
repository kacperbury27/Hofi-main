import { DARK } from '../../constants/theme';

const C = DARK;

export const LoadingSpinner = ({ size = 32, text = "Ładowanie..." }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "20px",
  }}>
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid ${C.s2}`,
      borderTop: `2px solid ${C.accent}`,
      animation: "spin 0.8s linear infinite",
    }} />
    {text && <span style={{ color: C.muted, fontSize: 12 }}>{text}</span>}
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export const LoadingOverlay = ({ visible = false, text = "Przetwarzanie..." }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(6, 6, 15, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <LoadingSpinner text={text} size={40} />
    </div>
  );
};

export default LoadingSpinner;
