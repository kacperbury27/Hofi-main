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

export default SlideScreen;
