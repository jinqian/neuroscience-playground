import { addDays } from './dates'

/** Days until the next review for each box. */
export const INTERVALS = [1, 2, 4, 8, 16]
const TOP = INTERVALS.length - 1

export type ReviewEntry = { box: number; due: string }

export function scheduleMiss(today: string): ReviewEntry {
  return { box: 0, due: addDays(today, INTERVALS[0]) }
}

export function scheduleReview(e: ReviewEntry, correct: boolean, today: string): ReviewEntry {
  if (!correct) return scheduleMiss(today)
  const box = Math.min(e.box + 1, TOP)
  return { box, due: addDays(today, INTERVALS[box]) }
}

export function dueItems(review: Record<string, ReviewEntry>, today: string): string[] {
  return Object.entries(review)
    .filter(([, e]) => e.due <= today)
    .map(([id]) => id)
}
