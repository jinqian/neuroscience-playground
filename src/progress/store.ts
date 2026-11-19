import { createStore, useStore } from 'zustand'
import type { Lesson, Unit } from '../content/schema'
import { XP } from '../engine/xp'
import type { Lang } from '../i18n/lang'
import { localDay } from './dates'
import { lessonStructures, lessonTerms } from './discovery'
import { scheduleMiss } from './leitner'
import { defaultProgress, loadProgress, safeLocalStorage, saveProgress, type Progress, type ProgressStorage } from './storage'
import { recordActivity } from './streak'

export type ProgressActions = {
  setLang(l: Lang): void
  addXp(n: number): void
  completeLesson(lesson: Lesson, missedQuestionIds: string[], now: Date): void
  recordStructureQuiz(structureId: string, correct: boolean, now: Date): void
  /** Tells the store which units exist, so a solved Case can award its unit badge. */
  setUnits(units: Unit[]): void
  reset(): void
}

export type ProgressState = Progress & ProgressActions

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]

export function createProgressStore(storage: ProgressStorage | null, initialUnits: Unit[] = []) {
  let units = initialUnits
  const store = createStore<ProgressState>()((set, get) => ({
    ...loadProgress(storage),
    setLang: (lang) => set({ lang }),
    addXp: (n) => set({ xp: get().xp + n }),
    setUnits: (u) => { units = u },
    reset: () => set(defaultProgress()),
    completeLesson: (lesson, missed, now) => {
      const s = get()
      const today = localDay(now)
      const review = { ...s.review }
      for (const q of missed) review[`q:${lesson.id}:${q}`] = scheduleMiss(today)
      const unit = units.find((u) => u.lessons.includes(lesson.id))
      set({
        completed: { ...s.completed, [lesson.id]: { at: now.toISOString() } },
        streak: recordActivity(s.streak, today),
        discovered: union(s.discovered, lessonStructures(lesson)),
        metTerms: union(s.metTerms, lessonTerms(lesson)),
        review,
        badges: lesson.type === 'case' && unit ? union(s.badges, [unit.id]) : s.badges,
      })
    },
    recordStructureQuiz: (structureId, correct, now) => {
      const s = get()
      if (correct) set({ xp: s.xp + XP.correct })
      else set({ review: { ...s.review, [`s:${structureId}`]: scheduleMiss(localDay(now)) } })
    },
  }))
  store.subscribe((state) => {
    const { version, lang, xp, streak, completed, review, discovered, metTerms, badges } = state
    saveProgress(storage, { version, lang, xp, streak, completed, review, discovered, metTerms, badges })
  })
  return store
}

export const progressStore = createProgressStore(safeLocalStorage())

export function useProgress<T>(selector: (s: ProgressState) => T): T {
  return useStore(progressStore, selector)
}
