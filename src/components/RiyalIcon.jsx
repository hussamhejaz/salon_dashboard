import riyalSvg from "../imgs/Saudi_Riyal_Symbol.svg";

function RiyalIcon({ size = 16, className = "" }) {
  return (
    <img
      src={riyalSvg}
      alt="ريال"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export default RiyalIcon;
