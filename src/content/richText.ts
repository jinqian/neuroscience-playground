export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'term'; termId: string; label?: string }

/** Field names whose text may contain `**bold**` and `[[term-id]]` / `[[term-id|label]]` markup. */
export const RICH_KEYS = ['body', 'explain', 'story', 'text', 'solved', 'prompt', 'statement', 'goal', 'simplified'] as const

const RICH = new Set<string>(RICH_KEYS)
/** Answer choices are shown as plain text, so their `text` never holds markup. */
const PLAIN_CONTAINER = /(options|steps|reasons)\[\d+\]$/

/**
 * Whether the LText at `path` (its own key `key`, its parent object's key `parentKey`) is rendered as rich text.
 * Case final explanations are keyed by option id, so they're recognised by their parent.
 */
export function isRichField(path: string, key: string, parentKey: string): boolean {
  if (parentKey === 'explanations') return true
  if (!RICH.has(key)) return false
  const parent = path.slice(0, path.length - key.length - 1)
  return !PLAIN_CONTAINER.test(parent)
}

/** Markup that didn't parse: stray [[ or ]] left in plain segments. */
export function hasBrokenMarkup(text: string): boolean {
  return parseRich(text).some((s) => s.kind === 'text' && /\[\[|\]\]/.test(s.text))
}

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
