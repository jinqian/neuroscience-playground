import { addDays } from './dates'

export type Streak = { current: number; lastDay: string | null }

export function recordActivity(s: Streak, today: string): Streak {
  if (s.lastDay === today) return s
  if (s.lastDay && addDays(s.lastDay, 1) === today) return { current: s.current + 1, lastDay: today }
  return { current: 1, lastDay: today }
}

/** The streak to show today: 0 once a whole day has been missed. */
export function displayStreak(s: Streak, today: string): number {
  if (!s.lastDay) return 0
  return s.lastDay === today || addDays(s.lastDay, 1) === today ? s.current : 0
}
