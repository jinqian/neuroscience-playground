const pad = (n: number) => String(n).padStart(2, '0')

/** The local calendar day as YYYY-MM-DD (not UTC). */
export function localDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Adds whole days to a YYYY-MM-DD string. Uses UTC arithmetic so DST never shifts the date. */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}
