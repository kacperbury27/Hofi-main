import { DARK } from '../../constants/theme';

const C = DARK;

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

export default Avatar;
