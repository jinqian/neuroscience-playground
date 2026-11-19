import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { progressStore } from '../progress/store'
import { fixtureBundle } from '../test/fixtures'
import App from './App'
import { PathScreen } from './PathScreen'

beforeEach(() => progressStore.getState().reset())

function renderPath() {
  return render(
    <LanguageProvider>
      <ContentProvider bundle={fixtureBundle()}>
        <MemoryRouter>
          <PathScreen />
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}

test('path shows unit banners and node states', () => {
  renderPath()
  expect(screen.getByText('Unit 1 · Meet the Cells')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Meet the neuron/ })).toHaveAttribute('data-state', 'current')
  expect(screen.getByRole('button', { name: /No two alike/ })).toHaveAttribute('data-state', 'locked')
})

test('a unit without lessons says coming soon', () => {
  renderPath()
  expect(screen.getByText('Unit 3 · Brain Map')).toBeInTheDocument()
  expect(screen.getByText('Coming soon')).toBeInTheDocument()
})

test('content errors show file, path and message instead of the app (Review Focus 5)', () => {
  render(<App loaded={{ errors: [{ file: 'content/lessons/u01/x.yaml', path: 'questions[0].answer', message: 'unknown option "z"' }] }} />)
  expect(screen.getByText(/content\/lessons\/u01\/x\.yaml/)).toBeInTheDocument()
  expect(screen.getByText(/questions\[0\]\.answer/)).toBeInTheDocument()
  expect(screen.getByText(/unknown option "z"/)).toBeInTheDocument()
  expect(screen.queryByText('Unit 1 · Meet the Cells')).not.toBeInTheDocument()
})

test('App renders the path when content is valid', () => {
  render(<App loaded={{ bundle: fixtureBundle(), errors: [] }} />)
  expect(screen.getByText('Unit 1 · Meet the Cells')).toBeInTheDocument()
})
