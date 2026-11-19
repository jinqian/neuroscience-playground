import { describe, expect, test, vi } from 'vitest'
import type { Case, Lesson, Unit } from '../content/schema'
import { nodeStates } from './access'
import { lessonStructures, lessonTerms } from './discovery'
import { dueItems, scheduleMiss, scheduleReview } from './leitner'
import { defaultProgress, loadProgress, STORAGE_KEY } from './storage'
import { createProgressStore } from './store'
import { displayStreak, recordActivity } from './streak'

const t = (en: string) => ({ en })

describe('streak', () => {
  test('consecutive day increments', () => {
    expect(recordActivity({ current: 3, lastDay: '2026-11-18' }, '2026-11-19').current).toBe(4)
  })
  test('same day is unchanged', () => {
    expect(recordActivity({ current: 3, lastDay: '2026-11-19' }, '2026-11-19').current).toBe(3)
  })
  test('a two-day gap restarts at 1', () => {
    expect(recordActivity({ current: 3, lastDay: '2026-11-17' }, '2026-11-19').current).toBe(1)
  })
  test('display shows 0 once a day was missed', () => {
    expect(displayStreak({ current: 5, lastDay: '2026-11-17' }, '2026-11-19')).toBe(0)
    expect(displayStreak({ current: 5, lastDay: '2026-11-18' }, '2026-11-19')).toBe(5)
  })
})

describe('leitner', () => {
  test('a miss goes to box 0, due tomorrow', () => {
    expect(scheduleMiss('2026-11-19')).toEqual({ box: 0, due: '2026-11-20' })
  })
  test('correct moves up a box with that box interval', () => {
    expect(scheduleReview({ box: 0, due: '2026-11-20' }, true, '2026-11-20')).toEqual({ box: 1, due: '2026-11-22' })
  })
  test('the top box stays at 16 days', () => {
    expect(scheduleReview({ box: 4, due: '2026-11-20' }, true, '2026-11-20')).toEqual({ box: 4, due: '2026-12-06' })
  })
  test('wrong falls back to box 0', () => {
    expect(scheduleReview({ box: 3, due: '2026-11-20' }, false, '2026-11-20')).toEqual({ box: 0, due: '2026-11-21' })
  })
  test('dueItems lists entries due today or earlier', () => {
    expect(dueItems({ a: { box: 0, due: '2026-11-19' }, b: { box: 0, due: '2026-11-21' }, c: { box: 1, due: '2026-11-01' } }, '2026-11-19')).toEqual(['a', 'c'])
  })
})

const card = (id: string) => ({ id, body: t('x') })
const mcq = (id: string) => ({ id, kind: 'mc' as const, prompt: t('p'), options: [{ id: 'a', text: t('a') }, { id: 'b', text: t('b') }], answer: 'a', explain: t('e') })
const lessons: Record<string, Lesson> = {
  b1: { id: 'b1', type: 'bite', title: t('b1'), sources: [], cards: [{ ...card('c1'), body: t('The [[soma]] here.'), explore3d: ['spinal-cord'] }], questions: [mcq('q1')] },
  lab1: { id: 'lab1', type: 'lab', title: t('lab'), sources: [], intro: [card('c1')], sim: 'threshold', goal: t('g'), simplified: t('s'), reflection: [mcq('q1')] },
  b2: { id: 'b2', type: 'bite', title: t('b2'), sources: [], cards: [card('c1')], questions: [{ id: 'q1', kind: 'tap3d', prompt: t('Find'), structure: 'cerebellum', explain: t('e') }] },
  case: {
    id: 'case', type: 'case', title: t('c'), sources: [], story: t('A [[myelin]] story.'),
    clues: [{ id: 'k1', text: t('clue') }],
    final: { prompt: t('Where?'), kind: 'tap3d', candidates: ['brainstem', 'cerebellum'], answer: 'brainstem', explanations: { brainstem: t('y'), cerebellum: t('n') } },
    solved: t('done'),
  },
}
const unit: Unit = { id: 'u01', number: 1, title: t('U'), nickname: t('N'), color: '#000', module: 'M', lessons: ['b1', 'lab1', 'b2', 'case'] }

describe('nodeStates', () => {
  test('nothing done: first bite current, the rest locked', () => {
    expect(nodeStates(unit, lessons, new Set())).toEqual({ b1: 'current', lab1: 'locked', b2: 'locked', case: 'locked' })
  })
  test('after the first bite: lab and next bite open, case locked', () => {
    expect(nodeStates(unit, lessons, new Set(['b1']))).toEqual({ b1: 'done', lab1: 'current', b2: 'open', case: 'locked' })
  })
  test('labs never gate the case', () => {
    expect(nodeStates(unit, lessons, new Set(['b1', 'b2']))).toEqual({ b1: 'done', lab1: 'current', b2: 'done', case: 'open' })
  })
})

describe('discovery', () => {
  test('structures come from explore3d, tap3d and a tap3d case final', () => {
    expect(lessonStructures(lessons.b1)).toEqual(['spinal-cord'])
    expect(lessonStructures(lessons.b2)).toEqual(['cerebellum'])
    expect(lessonStructures(lessons.case)).toEqual(['brainstem'])
  })
  test('terms come from rich text', () => {
    expect(lessonTerms(lessons.b1)).toEqual(['soma'])
    expect(lessonTerms(lessons.case)).toEqual(['myelin'])
  })
})

describe('storage (Review Focus 1)', () => {
  test('no storage gives defaults', () => {
    expect(loadProgress(null)).toEqual(defaultProgress())
  })
  test('a throwing storage gives defaults', () => {
    const storage = { getItem: () => { throw new Error('denied') }, setItem: vi.fn() }
    expect(loadProgress(storage)).toEqual(defaultProgress())
  })
  test('corrupt JSON gives defaults and keeps a copy', () => {
    const setItem = vi.fn()
    expect(loadProgress({ getItem: () => '{bad', setItem })).toEqual(defaultProgress())
    expect(setItem).toHaveBeenCalledWith('neuro-playground:v1:corrupt', '{bad')
    expect(STORAGE_KEY).toBe('neuro-playground:v1')
  })
  test('valid saved progress loads back', () => {
    const saved = { ...defaultProgress(), xp: 120 }
    expect(loadProgress({ getItem: () => JSON.stringify(saved), setItem: vi.fn() }).xp).toBe(120)
  })
})

describe('store', () => {
  function memory() {
    const data: Record<string, string> = {}
    return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v } }
  }

  test('completing a case records badge, discoveries, terms, misses and streak, and persists', () => {
    const storage = memory()
    const store = createProgressStore(storage, [unit])
    const now = new Date(2026, 10, 19, 12, 0)
    store.getState().completeLesson(lessons.case as Case, ['q1'], now)
    const p = store.getState()
    expect(p.completed.case).toBeDefined()
    expect(p.badges).toEqual(['u01'])
    expect(p.discovered).toEqual(['brainstem'])
    expect(p.metTerms).toEqual(['myelin'])
    expect(p.review['q:case:q1']).toEqual({ box: 0, due: '2026-11-20' })
    expect(p.streak).toEqual({ current: 1, lastDay: '2026-11-19' })
    expect(JSON.parse(storage.data['neuro-playground:v1']).badges).toEqual(['u01'])
  })

  test('a case not listed in any known unit earns no badge', () => {
    const store = createProgressStore(memory(), [])
    store.getState().completeLesson(lessons.case, [], new Date())
    expect(store.getState().badges).toEqual([])
  })

  test('structure quiz: correct adds 10 XP, a miss schedules a review', () => {
    const store = createProgressStore(memory())
    const now = new Date(2026, 10, 19, 12, 0)
    store.getState().recordStructureQuiz('cerebellum', true, now)
    store.getState().recordStructureQuiz('brainstem', false, now)
    expect(store.getState().xp).toBe(10)
    expect(store.getState().review['s:brainstem']).toEqual({ box: 0, due: '2026-11-20' })
  })
})
