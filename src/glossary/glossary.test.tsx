import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Term } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { progressStore } from '../progress/store'
import { fixtureBundle } from '../test/fixtures'
import { filterTerms, firstLessonForTerm } from './glossaryIndex'
import { GlossaryScreen } from './GlossaryScreen'

const terms: Term[] = [
  { id: 'action-potential', en: 'action potential', fr: "potentiel d'action", unit: 'u02' },
  { id: 'distance', en: 'distance', fr: 'éloignement', unit: 'u04' },
  { id: 'vor', en: 'vestibulo-ocular reflex', abbr: 'VOR', unit: 'u06' },
  { id: 'soma', en: 'soma', unit: 'u01' },
]

describe('filterTerms', () => {
  test('matches French text', () => {
    expect(filterTerms(terms, 'potentiel', 'all').map((t) => t.id)).toEqual(['action-potential'])
  })
  test('ignores accents', () => {
    expect(filterTerms(terms, 'eloignement', 'all').map((t) => t.id)).toEqual(['distance'])
  })
  test('matches abbreviations, case-insensitively', () => {
    expect(filterTerms(terms, 'vor', 'all').map((t) => t.id)).toEqual(['vor'])
  })
  test('filters by unit', () => {
    expect(filterTerms(terms, '', 'u01').map((t) => t.id)).toEqual(['soma'])
  })
})

test('firstLessonForTerm finds the first lesson in course order that uses a term', () => {
  expect(firstLessonForTerm(fixtureBundle())).toEqual({ soma: 'u01-b01' })
})

function renderScreen() {
  return render(
    <LanguageProvider>
      <ContentProvider bundle={fixtureBundle()}>
        <MemoryRouter><GlossaryScreen /></MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}

beforeEach(() => progressStore.getState().reset())

test('the empty state shows before any term is met', () => {
  renderScreen()
  expect(screen.getByText('Terms you meet in lessons show up here.')).toBeInTheDocument()
})

test('met terms show in a three-language table linking to their lesson', () => {
  progressStore.setState({ metTerms: ['soma'] })
  renderScreen()
  const link = screen.getByRole('link', { name: 'soma' })
  expect(link).toHaveAttribute('href', '/lesson/u01-b01')
  expect(screen.getByRole('columnheader', { name: '中文' })).toBeInTheDocument()
  expect(screen.getAllByText('—')).toHaveLength(2)
})
