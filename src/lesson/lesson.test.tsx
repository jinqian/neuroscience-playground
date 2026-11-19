import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Bite, ContentBundle } from '../content/schema'
import { FIGURES } from '../illustrations/registry'
import type { Lang } from '../i18n/lang'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { progressStore } from '../progress/store'
import { fixtureBundle } from '../test/fixtures'
import { LessonScreen } from './LessonScreen'
import { seededShuffle } from './questions/shuffle'

const t = (en: string, fr?: string) => (fr ? { en, fr } : { en })

const bite: Bite = {
  id: 'u01-b09', type: 'bite', title: t('All kinds'), sources: [],
  cards: [
    { id: 'c1', body: t('The [[soma]] is the cell body.') },
    { id: 'c2', body: t('Second card.'), verify: true },
  ],
  questions: [
    { id: 'q1', kind: 'mc', prompt: t('Which is the inbox?', 'Quelle est la boîte de réception ?'), options: [{ id: 'a', text: t('Dendrites') }, { id: 'b', text: t('Axon') }], answer: 'a', explain: t('Dendrites receive.') },
    { id: 'q2', kind: 'gap', prompt: t('The body is the ___.'), options: [{ id: 'a', text: t('soma') }, { id: 'b', text: t('myelin') }], answer: 'a', explain: t('Soma = body.') },
    { id: 'q3', kind: 'order', prompt: t('Order the flow.'), steps: [{ id: 's1', text: t('Dendrite') }, { id: 's2', text: t('Soma') }, { id: 's3', text: t('Axon') }], explain: t('In, middle, out.') },
    { id: 'q4', kind: 'match', prompt: t('Match.'), pairs: [{ id: 'p1', left: t('CNS'), right: t('Oligodendrocyte') }, { id: 'p2', left: t('PNS'), right: t('Schwann cell') }, { id: 'p3', left: t('Immune'), right: t('Microglia') }], explain: t('Myelin makers.') },
    { id: 'q5', kind: 'tfwhy', statement: t('Neurons divide a lot.'), isTrue: false, reasons: [{ id: 'r1', text: t('Mature neurons rarely divide.') }, { id: 'r2', text: t('They divide daily.') }], answerReason: 'r1', explain: t('Mostly post-mitotic.') },
    { id: 'q6', kind: 'tap2d', prompt: t('Tap the soma.'), figure: 'test-neuron', answer: 'soma', explain: t('The round part.') },
  ],
}

function bundle(): ContentBundle {
  const b = fixtureBundle()
  b.lessons[bite.id] = bite
  b.units[0].lessons.push(bite.id)
  return b
}

beforeAll(() => {
  FIGURES['test-neuron'] = {
    regions: ['soma', 'axon'],
    Component: ({ onTap }) => (
      <svg>
        <g role="button" aria-label="soma" onClick={() => onTap('soma')} />
        <g role="button" aria-label="axon" onClick={() => onTap('axon')} />
      </svg>
    ),
  }
})
beforeEach(() => progressStore.getState().reset())

function renderLesson(enabled: Lang[] = ['en']) {
  return render(
    <LanguageProvider enabled={enabled}>
      <ContentProvider bundle={bundle()}>
        <MemoryRouter initialEntries={[`/lesson/${bite.id}`]}>
          <Routes>
            <Route path="/lesson/:lessonId" element={<LessonScreen />} />
            <Route path="/" element={<p>PATH</p>} />
          </Routes>
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const check = () => click('Check')
const cont = () => click('Continue')

function solveOrder() {
  // bubble the items into s1, s2, s3 using the move-up buttons
  const want = ['Dendrite', 'Soma', 'Axon']
  for (let target = 0; target < want.length; target++) {
    let items = screen.getAllByRole('listitem').map((li) => li.getAttribute('data-label'))
    let pos = items.indexOf(want[target])
    while (pos > target) {
      fireEvent.click(screen.getByRole('button', { name: `Move ${want[target]} up` }))
      items = screen.getAllByRole('listitem').map((li) => li.getAttribute('data-label'))
      pos = items.indexOf(want[target])
    }
  }
}

function solveMatch() {
  for (const [l, r] of [['CNS', 'Oligodendrocyte'], ['PNS', 'Schwann cell'], ['Immune', 'Microglia']]) {
    click(l)
    click(r)
  }
}

function progressValue() {
  return screen.getByRole('progressbar').getAttribute('aria-valuenow')
}

describe('bite play-through', () => {
  test('wrong answers re-queue, every kind can be solved, and the lesson completes', () => {
    renderLesson()
    expect(screen.queryByText(/As a developer/)).not.toBeInTheDocument()
    cont()
    expect(screen.getByText('Check against the course')).toBeInTheDocument()
    cont()

    // q1 wrong
    click('Axon')
    check()
    expect(screen.getByText('Dendrites receive.')).toBeInTheDocument()
    expect(progressValue()).toBe('0')
    cont()

    click('soma'); check(); cont()
    solveOrder(); check(); cont()
    solveMatch(); check(); cont()
    click('False'); click('Mature neurons rarely divide.'); check(); cont()
    click('soma'); check(); cont()

    // q1 comes back last
    expect(screen.getByText('Which is the inbox?')).toBeInTheDocument()
    click('Dendrites'); check(); cont()

    expect(screen.getByText('+60 XP')).toBeInTheDocument()
    const p = progressStore.getState()
    expect(p.completed[bite.id]).toBeDefined()
    expect(p.review[`q:${bite.id}:q1`]).toBeDefined()
    expect(Object.keys(p.review)).toHaveLength(1)
    expect(p.xp).toBe(60)
  })
})

test('switching language mid-question keeps the selection and the place (Review Focus 2)', () => {
  renderLesson(['en', 'fr'])
  cont(); cont()
  click('Dendrites')
  expect(screen.getByRole('button', { name: 'Dendrites' })).toHaveAttribute('aria-pressed', 'true')
  act(() => { fireEvent.click(screen.getByRole('button', { name: 'FR' })) })
  expect(screen.getByText('Quelle est la boîte de réception ?')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Dendrites' })).toHaveAttribute('aria-pressed', 'true')
  expect(progressValue()).toBe('0')
})

test('a term opens a popover with all three languages, missing ones coming soon', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  renderLesson()
  click('soma')
  const pop = screen.getByRole('dialog')
  expect(within(pop).getByText('soma', { selector: '.term-pop__value' })).toBeInTheDocument()
  expect(within(pop).getAllByText('Coming soon')).toHaveLength(2)
  expect(within(pop).getByText(/Greek sōma, body/)).toBeInTheDocument()
  const wiki = within(pop).getByRole('link', { name: /Wikipedia/ })
  expect(wiki).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Soma_(biology)')
  expect(wiki).toHaveAttribute('target', '_blank')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  // the popover sits inside a paragraph, so it must only use inline elements
  expect(errors.mock.calls.filter((c) => String(c[0]).includes('cannot be a descendant'))).toEqual([])
  errors.mockRestore()
})

test('seeded shuffle is stable per question id', () => {
  expect(seededShuffle(['a', 'b', 'c', 'd'], 'q3')).toEqual(seededShuffle(['a', 'b', 'c', 'd'], 'q3'))
})
