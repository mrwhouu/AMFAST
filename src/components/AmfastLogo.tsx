/**
 * Vektoriserad approximation av AMfast-loggan (byggnadssymbol + ordmärke).
 * Ritas av eftersom bildfilen användaren skickade inte kunde sparas som fil i
 * den här miljön — byt ut mot den riktiga filen om den läggs i repot
 * (t.ex. public/amfast-logo.png) genom att ersätta denna komponent med en
 * <img src="/amfast-logo.png" />.
 */
export function AmfastIcon({ height = 28, color = '#16233F' }: { height?: number; color?: string }) {
  return (
    <svg
      width={height}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M4 34 L4 18 L12 8 L12 34" />
      <path d="M12 14 L20 4 L20 34" />
      <path d="M20 34 L28 20 L28 34" />
      <path d="M28 34 L36 24 L36 34" />
      <path d="M4 34 L36 34" />
      <path d="M12 20 L12 34 M20 20 L20 34 M28 26 L28 34" strokeWidth="1.4" />
    </svg>
  )
}

export function AmfastLogo({ height = 28, color = '#16233F' }: { height?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height }}>
      <AmfastIcon height={height} color={color} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: height * 0.75,
          color,
          letterSpacing: '-0.01em',
        }}
      >
        AMfast
      </span>
    </span>
  )
}
