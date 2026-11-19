export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'term'; termId: string; label?: string }

/** Field names whose text may contain `**bold**` and `[[term-id]]` / `[[term-id|label]]` markup. */
export const RICH_KEYS = ['body', 'explain', 'story', 'text', 'solved', 'prompt', 'statement'] as const

const TOKEN = /\*\*(.+?)\*\*|\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g

export function parseRich(text: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ kind: 'bold', text: m[1] })
    else out.push(m[3] !== undefined ? { kind: 'term', termId: m[2], label: m[3] } : { kind: 'term', termId: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
  return out
}

/** Plain text with markup removed (term shows its label or its id). */
export function plainText(text: string): string {
  return parseRich(text)
    .map((s) => (s.kind === 'term' ? (s.label ?? s.termId.replace(/-/g, ' ')) : s.text))
    .join('')
}

export function wordCount(text: string): number {
  return plainText(text).split(/\s+/).filter(Boolean).length
}
