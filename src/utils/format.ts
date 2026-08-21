export const fmt = (n: number) => Math.round(n).toLocaleString('sv-SE')

export const fmtArea = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(1)).replace('.', ',')

export const fmtPct = (n: number) => n.toFixed(1).replace('.', ',')
