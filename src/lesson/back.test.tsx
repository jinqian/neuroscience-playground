import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Bite, ContentBundle } from '../content/schema'
import { startRun } from '../engine/lessonRun'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { progressStore } from '../progress/store'
import { fixtureBundle, mcq } from '../test/fixtures'
import { LessonScreen } from './LessonScreen'

const t = (en: string) => ({ en })
const bite: Bite = {
  id: 'u01-b21', type: 'bite', title: t('Go back'), sources: [],
  cards: [{ id: 'c1', body: t('Intro card.') }],
  questions: [mcq('q1'), mcq('q2')],
}

function bundle(): ContentBundle {
  const b = fixtureBundle()
  b.lessons[bite.id] = bite
  b.units[0].lessons.push(bite.id)
  return b
}

function open() {
  return render(
    <LanguageProvider>
      <ContentProvider bundle={bundle()}>
        <MemoryRouter initialEntries={[`/lesson/${bite.id}`]}>
          <Routes><Route path="/lesson/:lessonId" element={<LessonScreen />} /></Routes>
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const backButton = () => screen.queryByRole('button', { name: 'Go back' })
const progressValue = () => screen.getByRole('progressbar').getAttribute('aria-valuenow')

beforeEach(() => progressStore.getState().reset())

describe('going back inside a lesson', () => {
  test('the first page has no Back button', () => {
    open()
    expect(backButton()).toBeNull()
  })

  test('Back returns to the previous card, Continue comes forward again', () => {
    open()
    click('Continue')
    click('Go back')
    expect(screen.getByText('Intro card.')).toBeInTheDocument()
    expect(backButton()).toBeNull()
    click('Continue')
    expect(screen.getByText('Question q1?')).toBeInTheDocument()
  })

  test('an answered question is read-only on Back, with its explanation', () => {
    open()
    click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    click('Go back')
    expect(screen.getByText('Question q1?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeDisabled()
    expect(screen.getByText('You got this right')).toBeInTheDocument()
    expect(screen.getByText('Because q1.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Check' })).toBeNull()
  })

  test('going back changes no XP and no progress', () => {
    open()
    click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    click('Go back'); click('Go back')
    expect(progressStore.getState().xp).toBe(10)
    expect(progressValue()).toBe('1')
    click('Continue'); click('Continue')
    expect(screen.getByText('Question q2?')).toBeInTheDocument()
    expect(progressStore.getState().xp).toBe(10)
    expect(progressValue()).toBe('1')
  })

  test('a wrong then right answer shows as two pages', () => {
    open()
    click('Continue')
    click('Beta'); click('Check'); click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    expect(screen.getByText('Question q1?')).toBeInTheDocument()
    click('Go back')
    expect(screen.getByText('Question q2?')).toBeInTheDocument()
    click('Go back')
    expect(screen.getByText('Not quite, this time')).toBeInTheDocument()
    expect(screen.getByText('You answered it again later in the lesson.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Beta' })).toBeDisabled()
    click('Continue'); click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    expect(screen.getByText('+20 XP')).toBeInTheDocument()
  })

  test('an unchecked draft survives a trip back', () => {
    open()
    click('Continue')
    click('Alpha')
    click('Go back')
    click('Continue')
    expect(screen.getByRole('button', { name: 'Check' })).toBeEnabled()
    click('Check')
    expect(progressStore.getState().xp).toBe(10)
  })

  test('the history survives leaving and reopening', () => {
    const first = open()
    click('Continue')
    click('Alpha'); click('Check'); click('Continue')
    first.unmount()
    open()
    click('Go back')
    expect(screen.getByText('You got this right')).toBeInTheDocument()
  })

  test('a saved place from before going back existed still resumes', () => {
    const run = { ...startRun([{ kind: 'card', id: 'c1' }, { kind: 'question', id: 'q1' }, { kind: 'question', id: 'q2' }]), index: 2 }
    progressStore.getState().saveLessonState(bite.id, { run, drafts: {}, result: 'idle' })
    open()
    expect(screen.getByText('Question q2?')).toBeInTheDocument()
    expect(backButton()).toBeNull()
  })
})
