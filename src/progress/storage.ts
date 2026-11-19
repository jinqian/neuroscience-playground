import { z } from 'zod'
import type { Lang } from '../i18n/lang'
import type { ReviewEntry } from './leitner'
import type { Streak } from './streak'

export const STORAGE_KEY = 'neuro-playground:v1'
const CORRUPT_KEY = 'neuro-playground:v1:corrupt'

export type Progress = {
  version: 1
  lang: Lang
  xp: number
  streak: Streak
  completed: Record<string, { at: string }>
  review: Record<string, ReviewEntry>
  discovered: string[]
  metTerms: string[]
  badges: string[]
  /** Where the learner is inside unfinished lessons, keyed by lesson id (or `<lesson id>:<part>`). */
  lessonState: Record<string, unknown>
}

const ProgressSchema = z.object({
  version: z.literal(1),
  lang: z.enum(['en', 'fr', 'zh']),
  xp: z.number(),
  streak: z.object({ current: z.number(), lastDay: z.string().nullable() }),
  completed: z.record(z.string(), z.object({ at: z.string() })),
  review: z.record(z.string(), z.object({ box: z.number(), due: z.string() })),
  discovered: z.array(z.string()),
  metTerms: z.array(z.string()),
  badges: z.array(z.string()),
  lessonState: z.record(z.string(), z.unknown()).default({}),
})

export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>

export function defaultProgress(): Progress {
  return {
    version: 1, lang: 'en', xp: 0, streak: { current: 0, lastDay: null },
    completed: {}, review: {}, discovered: [], metTerms: [], badges: [], lessonState: {},
  }
}

export function loadProgress(storage: ProgressStorage | null): Progress {
  if (!storage) return defaultProgress()
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return defaultProgress()
  }
  if (raw === null) return defaultProgress()
  try {
    const parsed = ProgressSchema.safeParse(JSON.parse(raw))
    if (parsed.success) return parsed.data
  } catch {
    // fall through: keep a copy of what was there
  }
  try { storage.setItem(CORRUPT_KEY, raw) } catch { /* ignore */ }
  return defaultProgress()
}

export function saveProgress(storage: ProgressStorage | null, p: Progress): void {
  if (!storage) return
  try { storage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch { /* storage full or blocked */ }
}

/** localStorage if the browser lets us touch it, otherwise null. */
export function safeLocalStorage(): ProgressStorage | null {
  try {
    const s = globalThis.localStorage
    if (!s) return null
    s.getItem(STORAGE_KEY)
    return s
  } catch {
    return null
  }
}
