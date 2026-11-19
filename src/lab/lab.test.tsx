import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Lab } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { LessonScreen } from '../lesson/LessonScreen'
import { progressStore } from '../progress/store'
import { fixtureBundle, mcq } from '../test/fixtures'
import { SIMS } from './registry'

const t = (en: string) => ({ en })
const lab: Lab = {
  id: 'u01-lab-fake', type: 'lab', title: t('Fake lab'), sources: [],
  intro: [{ id: 'c1', body: t('Welcome to the bench.') }], sim: 'fake',
  goal: t('Press the goal button.'), simplified: t('This is a toy.'),
  reflection: [mcq('q1'), mcq('q2')],
}

beforeAll(() => {
  SIMS.fake = {
    Component: ({ onGoalMet }) => <button type="button" onClick={onGoalMet}>Reach goal</button>,
  }
})
beforeEach(() => progressStore.getState().reset())

function renderLab() {
  const bundle = fixtureBundle()
  bundle.lessons[lab.id] = lab
  bundle.units[0].lessons.push(lab.id)
  return render(
    <LanguageProvider>
      <ContentProvider bundle={bundle}>
        <MemoryRouter initialEntries={[`/lesson/${lab.id}`]}>
          <Routes><Route path="/lesson/:lessonId" element={<LessonScreen />} /></Routes>
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}

const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

test('lab: intro, goal gates Continue and pays 20 XP once, reflection, completion', () => {
  renderLab()
  expect(screen.getByText('Welcome to the bench.')).toBeInTheDocument()
  click('Continue')

  expect(screen.getByText('Press the goal button.')).toBeInTheDocument()
  expect(screen.getByText('This is a toy.')).toBeInTheDocument()
  expect(screen.queryByText('Peek at the model')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  click('Reach goal')
  click('Reach goal')
  expect(progressStore.getState().xp).toBe(20)
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  click('Continue')

  click('Alpha'); click('Check'); click('Continue')
  click('Alpha'); click('Check'); click('Continue')

  expect(screen.getByText('+40 XP')).toBeInTheDocument()
  expect(progressStore.getState().xp).toBe(40)
  expect(progressStore.getState().completed[lab.id]).toBeDefined()
})
