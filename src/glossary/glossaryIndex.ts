import type { ContentBundle, Term } from '../content/schema'
import { lessonTerms } from '../progress/discovery'

/** For each term, the first lesson (in course order) that teaches it. */
export function firstLessonForTerm(bundle: ContentBundle): Record<string, string> {
  const out: Record<string, string> = {}
  for (const unit of bundle.units) {
    for (const id of unit.lessons) {
      const lesson = bundle.lessons[id]
      if (!lesson) continue
      for (const term of lessonTerms(lesson)) if (!(term in out)) out[term] = id
    }
  }
  return out
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Case- and accent-insensitive search over every language and the abbreviation. */
export function filterTerms(terms: Term[], query: string, unit: string | 'all'): Term[] {
  const q = fold(query.trim())
  return terms.filter((t) => {
    if (unit !== 'all' && t.unit !== unit) return false
    if (!q) return true
    return [t.en, t.fr, t.zh, t.abbr].some((v) => v && fold(v).includes(q))
  })
}
