export function Skyline({ opacity = 0.09 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 520 200"
      preserveAspectRatio="xMaxYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
      fill="none"
    >
      <g fill="#FFFFFF">
        <rect x="300" y="90" width="46" height="110" />
        <rect x="352" y="60" width="38" height="140" />
        <rect x="396" y="105" width="30" height="95" />
        <rect x="432" y="40" width="42" height="160" />
        <rect x="480" y="75" width="40" height="125" />
        <rect x="270" y="130" width="26" height="70" />
        <g fill="#0F1D30" opacity="0.5">
          <rect x="308" y="100" width="7" height="9" />
          <rect x="322" y="100" width="7" height="9" />
          <rect x="308" y="118" width="7" height="9" />
          <rect x="322" y="118" width="7" height="9" />
          <rect x="308" y="136" width="7" height="9" />
          <rect x="322" y="136" width="7" height="9" />
          <rect x="360" y="72" width="6" height="8" />
          <rect x="373" y="72" width="6" height="8" />
          <rect x="360" y="90" width="6" height="8" />
          <rect x="373" y="90" width="6" height="8" />
          <rect x="360" y="108" width="6" height="8" />
          <rect x="373" y="108" width="6" height="8" />
          <rect x="440" y="52" width="7" height="9" />
          <rect x="456" y="52" width="7" height="9" />
          <rect x="440" y="70" width="7" height="9" />
          <rect x="456" y="70" width="7" height="9" />
          <rect x="440" y="88" width="7" height="9" />
          <rect x="456" y="88" width="7" height="9" />
          <rect x="440" y="106" width="7" height="9" />
          <rect x="456" y="106" width="7" height="9" />
          <rect x="489" y="88" width="7" height="9" />
          <rect x="503" y="88" width="7" height="9" />
          <rect x="489" y="106" width="7" height="9" />
          <rect x="503" y="106" width="7" height="9" />
        </g>
      </g>
    </svg>
  )
}
