import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { ContentBundle } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { fixtureBundle } from '../test/fixtures'
import { Header } from '../ui/Header'
import { NeuronScreen } from './NeuronScreen'
import { choosePart, NEURON_PART_IDS } from './parts'

vi.mock('../brain/webgl', () => ({ hasWebGL: () => false }))

const names: Record<string, string> = {
  dendrites: 'Dendrites', soma: 'Soma (cell body)', nucleus: 'Nucleus', 'axon-hillock': 'Axon hillock',
  axon: 'Axon', myelin: 'Myelin sheath', 'node-of-ranvier': 'Node of Ranvier', 'axon-terminal': 'Axon terminals',
}

function bundle(): ContentBundle {
  const b = fixtureBundle()
  b.glossary = NEURON_PART_IDS.map((id) => ({ id, en: id, unit: 'u01', wiki: { en: `https://en.wikipedia.org/wiki/${id}` } }))
  b.neuron = NEURON_PART_IDS.map((id) => ({ id, name: { en: names[id] }, note: { en: `About the ${id}.` }, term: id }))
  return b
}

function renderScreen() {
  return render(
    <LanguageProvider>
      <ContentProvider bundle={bundle()}>
        <MemoryRouter><NeuronScreen /></MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}

test('the header links to the Neuron screen', () => {
  render(<LanguageProvider><MemoryRouter><Header /></MemoryRouter></LanguageProvider>)
  expect(screen.getByRole('link', { name: /Neuron/ })).toHaveAttribute('href', '/neuron')
})

test('without 3D, the Neuron screen lists every part', () => {
  renderScreen()
  expect(screen.getByText(/3D isn't available/)).toBeInTheDocument()
  for (const id of NEURON_PART_IDS) expect(screen.getByRole('button', { name: names[id] })).toBeInTheDocument()
})

test('picking a part shows its note and its Wikipedia link', () => {
  renderScreen()
  fireEvent.click(screen.getByRole('button', { name: 'Node of Ranvier' }))
  expect(screen.getByRole('heading', { name: 'Node of Ranvier' })).toBeInTheDocument()
  expect(screen.getByText('About the node-of-ranvier.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Wikipedia/ })).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/node-of-ranvier')
})

test('removing the myelin hides the myelin and its nodes, and clears a selection of them', () => {
  renderScreen()
  fireEvent.click(screen.getByRole('button', { name: 'Myelin sheath' }))
  expect(screen.getByRole('heading', { name: 'Myelin sheath' })).toBeInTheDocument()
  fireEvent.click(screen.getByLabelText('Remove myelin'))
  expect(screen.queryByRole('button', { name: 'Myelin sheath' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Node of Ranvier' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Myelin sheath' })).not.toBeInTheDocument()
  expect(screen.getByText('Tap a part of the neuron to learn about it.')).toBeInTheDocument()
})

test('a tap through the see-through soma picks the nucleus inside it', () => {
  expect(choosePart(['soma', 'nucleus'])).toBe('nucleus')
  expect(choosePart(['soma', 'axon'])).toBe('soma')
  expect(choosePart(['dendrites', 'soma', 'nucleus'])).toBe('dendrites')
  expect(choosePart([])).toBeUndefined()
})
