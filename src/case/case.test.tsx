import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Case } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { LessonScreen } from '../lesson/LessonScreen'
import { progressStore } from '../progress/store'
import { fixtureBundle, mcq } from '../test/fixtures'
import { canMakeFinalCall, finalCall, startCase, unlockClue } from './caseRun'

const t = (en: string) => ({ en })
const theCase: Case = {
  id: 'u01-case-feet', type: 'case', title: t('Tingling feet'), sources: [],
  story: t('A 34-year-old has tingling feet.'),
  clues: [
    { id: 'k1', text: t('It started a week after a stomach bug.') },
    { id: 'k2', text: t('Both feet, same time.') },
    { id: 'k3', text: t('Brain MRI is normal.'), unlock: mcq('q1') },
  ],
  final: {
    prompt: t('Whose myelin is under attack?'), kind: 'choice',
    options: [{ id: 'schwann', text: t('Schwann cells') }, { id: 'oligo', text: t('Oligodendrocytes') }, { id: 'astro', text: t('Astrocytes') }],
    answer: 'schwann',
    explanations: { schwann: t('Yes: peripheral myelin.'), oligo: t('Those wrap CNS axons, and the brain MRI is normal.'), astro: t('Astrocytes make no myelin.') },
  },
  solved: t('Peripheral demyelination fits every clue.'),
}

describe('caseRun', () => {
  test('clues without a question start unlocked', () => {
    expect([...startCase(theCase).unlocked]).toEqual(['k1', 'k2'])
  })
  test('the final call waits for every clue', () => {
    let s = startCase(theCase)
    expect(canMakeFinalCall(theCase, s)).toBe(false)
    s = unlockClue(s, 'k3', true)
    expect(canMakeFinalCall(theCase, s)).toBe(true)
    expect(s.xp).toBe(10)
  })
  test('a wrong unlock keeps the clue locked and records the miss once', () => {
    let s = startCase(theCase)
    s = unlockClue(s, 'k3', false)
    s = unlockClue(s, 'k3', false)
    expect(s.unlocked.has('k3')).toBe(false)
    expect(s.missed).toEqual(['q1'])
  })
  test('a wrong final call explains that option; the right one solves the case for 50 XP', () => {
    let s = unlockClue(startCase(theCase), 'k3', true)
    const wrong = finalCall(theCase, s, 'oligo')
    expect(wrong.correct).toBe(false)
    expect(wrong.explanation.en).toContain('CNS')
    expect(wrong.state.solved).toBe(false)
    s = wrong.state
    const right = finalCall(theCase, s, 'schwann')
    expect(right.correct).toBe(true)
    expect(right.state.solved).toBe(true)
    expect(right.state.xp).toBe(10 + 50)
    expect(right.state.finalAttempts).toBe(2)
  })
})

beforeEach(() => progressStore.getState().reset())

test('case screen play-through completes the lesson once', () => {
  const bundle = fixtureBundle()
  bundle.lessons[theCase.id] = theCase
  bundle.units[0].lessons.push(theCase.id)
  progressStore.getState().setUnits(bundle.units)
  render(
    <LanguageProvider>
      <ContentProvider bundle={bundle}>
        <MemoryRouter initialEntries={[`/lesson/${theCase.id}`]}>
          <Routes><Route path="/lesson/:lessonId" element={<LessonScreen />} /></Routes>
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
  const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

  expect(screen.getByText('A 34-year-old has tingling feet.')).toBeInTheDocument()
  expect(screen.queryByText('Whose myelin is under attack?')).not.toBeInTheDocument()

  click('Unlock clue 3')
  click('Beta'); click('Check')
  expect(screen.getByText('Because q1.')).toBeInTheDocument()
  click('Try again')
  click('Alpha'); click('Check')
  expect(screen.getByText('Brain MRI is normal.')).toBeInTheDocument()

  click('Oligodendrocytes')
  expect(screen.getByText('Those wrap CNS axons, and the brain MRI is normal.')).toBeInTheDocument()
  click('Schwann cells')
  expect(screen.getByText('Peripheral demyelination fits every clue.')).toBeInTheDocument()
  click('Finish')

  expect(screen.getByText('+60 XP')).toBeInTheDocument()
  const p = progressStore.getState()
  expect(p.completed[theCase.id]).toBeDefined()
  expect(p.badges).toEqual(['u01'])
  expect(p.xp).toBe(60)
  expect(p.review[`q:${theCase.id}:q1`]).toBeDefined()
})
