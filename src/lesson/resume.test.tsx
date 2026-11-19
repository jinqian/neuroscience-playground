import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Bite, Case, ContentBundle, Lab } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { SIMS } from '../lab/registry'
import { loadProgress, defaultProgress } from '../progress/storage'
import { progressStore } from '../progress/store'
import { fixtureBundle, mcq } from '../test/fixtures'
import { LessonScreen } from './LessonScreen'

const t = (en: string) => ({ en })
const bite: Bite = {
  id: 'u01-b20', type: 'bite', title: t('Resume me'), sources: [],
  cards: [{ id: 'c1', body: t('Intro card.') }],
  questions: [mcq('q1'), mcq('q2'), mcq('q3'), mcq('q4')],
}
const lab: Lab = {
  id: 'u01-lab-r', type: 'lab', title: t('Lab'), sources: [], intro: [{ id: 'c1', body: t('Bench intro.') }], sim: 'fake-r',
  goal: t('Press it.'), simplified: t('Toy.'), reflection: [mcq('q1'), mcq('q2')],
}
const theCase: Case = {
  id: 'u01-case-r', type: 'case', title: t('Case'), sources: [], story: t('A story.'),
  clues: [{ id: 'k1', text: t('First clue.') }, { id: 'k2', text: t('Hidden clue.'), unlock: mcq('q1') }],
  final: { prompt: t('Which?'), kind: 'choice', options: [{ id: 'x', text: t('X') }, { id: 'y', text: t('Y') }], answer: 'x', explanations: { x: t('yes'), y: t('no') } },
  solved: t('Done.'),
}

function bundle(): ContentBundle {
  const b = fixtureBundle()
  for (const l of [bite, lab, theCase]) { b.lessons[l.id] = l; b.units[0].lessons.push(l.id) }
  return b
}

function open(id: string, b = bundle()) {
  return render(
    <LanguageProvider>
      <ContentProvider bundle={b}>
        <MemoryRouter initialEntries={[`/lesson/${id}`]}>
          <Routes><Route path="/lesson/:lessonId" element={<LessonScreen />} /></Routes>
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const progressValue = () => screen.getByRole('progressbar').getAttribute('aria-valuenow')

beforeAll(() => {
  SIMS['fake-r'] = { Component: ({ onGoalMet }) => <button type="button" onClick={onGoalMet}>Reach goal</button> }
})
beforeEach(() => progressStore.getState().reset())

describe('a bite resumes where you left it', () => {
  test('after leaving mid-lesson, it reopens on the same question with progress and XP kept', () => {
    const first = open(bite.id)
    click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    expect(screen.getByText('Question q2?')).toBeInTheDocument()
    first.unmount()

    open(bite.id)
    expect(screen.getByText('Question q2?')).toBeInTheDocument()
    expect(progressValue()).toBe('1')
    expect(progressStore.getState().xp).toBe(10)
  })

  test('leaving while the feedback is showing reopens on that feedback, without re-scoring', () => {
    const first = open(bite.id)
    click('Continue')
    click('Beta'); click('Check')
    first.unmount()

    open(bite.id)
    expect(screen.getByText('Because q1.')).toBeInTheDocument()
    click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    expect(screen.getByText('Question q1?')).toBeInTheDocument()
    click('Alpha'); click('Check'); click('Continue')
    expect(screen.getByText('+40 XP')).toBeInTheDocument()
    expect(progressStore.getState().review[`q:${bite.id}:q1`]).toBeDefined()
  })

  test('finishing the lesson clears the saved place, so it starts fresh next time', () => {
    const first = open(bite.id)
    click('Continue')
    for (let i = 0; i < 4; i++) { click('Alpha'); click('Check'); click('Continue') }
    expect(Object.keys(progressStore.getState().lessonState)).toEqual([])
    first.unmount()
    open(bite.id)
    expect(screen.getByText('Intro card.')).toBeInTheDocument()
  })

  test('a saved place for content that has since changed is ignored', () => {
    const first = open(bite.id)
    click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    first.unmount()
    const changed = bundle()
    changed.lessons[bite.id] = { ...bite, questions: [mcq('n1'), mcq('n2'), mcq('n3'), mcq('n4')] }
    open(bite.id, changed)
    expect(screen.getByText('Intro card.')).toBeInTheDocument()
  })
})

test('a lab resumes on the simulation with the goal already reached, without paying XP twice', () => {
  const first = open(lab.id)
  click('Continue')
  click('Reach goal')
  first.unmount()
  open(lab.id)
  expect(screen.getByText('Press it.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  click('Reach goal')
  expect(progressStore.getState().xp).toBe(20)
})

test('a case resumes with its unlocked clues', () => {
  const first = open(theCase.id)
  click('Unlock clue 2'); click('Alpha'); click('Check')
  expect(screen.getByText('Hidden clue.')).toBeInTheDocument()
  first.unmount()
  open(theCase.id)
  expect(screen.getByText('Hidden clue.')).toBeInTheDocument()
  expect(screen.getByText('Which?')).toBeInTheDocument()
})

test('progress saved before this feature (no lessonState) still loads', () => {
  const { lessonState: _drop, ...old } = { ...defaultProgress(), xp: 30 }
  const loaded = loadProgress({ getItem: () => JSON.stringify(old), setItem: () => {} })
  expect(loaded.xp).toBe(30)
  expect(loaded.lessonState).toEqual({})
})
