import type { Response } from './check'

/** A page the learner has already seen: a card, or a question with the answer they checked. */
export type Page =
  | { kind: 'card'; id: string }
  | { kind: 'question'; id: string; response: Response; result: 'correct' | 'wrong' }

/** Pages seen so far, in order. `at` is the page being looked back at, or null when on the live page. */
export type History = { pages: Page[]; at: number | null }

export const emptyHistory: History = { pages: [], at: null }

/** Records the live page as it is left. */
export function leave(h: History, page: Page): History {
  return { pages: [...h.pages, page], at: null }
}

export function back(h: History): History {
  if (!h.pages.length) return h
  return { ...h, at: h.at === null ? h.pages.length - 1 : Math.max(0, h.at - 1) }
}

export function forward(h: History): History {
  if (h.at === null) return h
  return { ...h, at: h.at + 1 < h.pages.length ? h.at + 1 : null }
}

export function canGoBack(h: History): boolean {
  return h.pages.length > 0 && h.at !== 0
}

export function reviewing(h: History): Page | null {
  return h.at === null ? null : h.pages[h.at] ?? null
}
