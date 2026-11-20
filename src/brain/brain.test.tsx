import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Bite, ContentBundle, Structure } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { LessonScreen } from '../lesson/LessonScreen'
import { progressStore } from '../progress/store'
import { fixtureBundle } from '../test/fixtures'
import { ExplorerScreen } from './ExplorerScreen'
import { nodeToStructure, visualState } from './visual'

vi.mock('./webgl', () => ({ hasWebGL: () => false }))

const t = (en: string) => ({ en })
const structures: Structure[] = [
  { id: 'frontal-lobe', name: t('Frontal lobe'), note: t('Plans and moves.'), units: ['u01'], meshNodes: ['frontal-lobe_L', 'frontal-lobe_R'] },
  { id: 'cerebellum', name: t('Cerebellum'), note: t('Fine-tunes movement.'), units: ['u01'], meshNodes: ['cerebellum'] },
  { id: 'brainstem', name: t('Brainstem'), note: t('Breathing and reflexes.'), units: ['u02'], meshNodes: ['brainstem'] },
  { id: 'hypothalamus', name: t('Hypothalamus'), note: t('Keeps balance.'), units: ['u02'], meshNodes: ['hypothalamus'] },
  { id: 'spinal-cord', name: t('Spinal cord'), note: t('The cable.'), units: ['u01'], meshNodes: [], twoDOnly: true },
]

describe('visualState', () => {
  const base = { discovered: new Set(['cerebellum']), highlight: [] as string[], hemisphere: 'both' as const }
  test('discovered vs undiscovered', () => {
    expect(visualState('cerebellum', { ...base, node: 'cerebellum' })).toBe('discovered')
    expect(visualState('brainstem', { ...base, node: 'brainstem' })).toBe('undiscovered')
  })
  test('highlight beats discovered', () => {
    expect(visualState('cerebellum', { ...base, highlight: ['cerebellum'], node: 'cerebellum' })).toBe('highlight')
  })
  test('hemisphere hides the other side only for sided nodes', () => {
    expect(visualState('frontal-lobe', { ...base, hemisphere: 'left', node: 'frontal-lobe_R' })).toBe('hidden')
    expect(visualState('frontal-lobe', { ...base, hemisphere: 'left', node: 'frontal-lobe_L' })).toBe('undiscovered')
    expect(visualState('frontal-lobe', { ...base, hemisphere: 'right', node: 'frontal-lobe_L' })).toBe('hidden')
    expect(visualState('cerebellum', { ...base, hemisphere: 'right', node: 'cerebellum' })).toBe('discovered')
  })
  test('the only-filter hides everything else', () => {
    expect(visualState('cerebellum', { ...base, only: ['brainstem'], node: 'cerebellum' })).toBe('hidden')
    expect(visualState('brainstem', { ...base, only: ['brainstem'], node: 'brainstem' })).toBe('undiscovered')
  })
})

test('nodeToStructure maps mesh nodes back to structures', () => {
  expect(nodeToStructure(structures)).toEqual({
    'frontal-lobe_L': 'frontal-lobe', 'frontal-lobe_R': 'frontal-lobe', cerebellum: 'cerebellum', brainstem: 'brainstem', hypothalamus: 'hypothalamus',
  })
})

function bundle(): ContentBundle {
  const b = fixtureBundle()
  b.structures = structures
  const bite: Bite = {
    id: 'u01-b08', type: 'bite', title: t('Find it'), sources: [],
    cards: [{ id: 'c1', body: t('Look around.') }],
    questions: [
      { id: 'q1', kind: 'tap3d', prompt: t('Find the cerebellum.'), structure: 'cerebellum', explain: t('Back and bottom.') },
      { id: 'q2', kind: 'tap3d', prompt: t('Find the brainstem.'), structure: 'brainstem', explain: t('Below.') },
      { id: 'q3', kind: 'tap3d', prompt: t('Find the hypothalamus.'), structure: 'hypothalamus', explain: t('Under the thalamus.') },
      { id: 'q4', kind: 'tap3d', prompt: t('Find the frontal lobe.'), structure: 'frontal-lobe', explain: t('Front.') },
    ],
  }
  b.lessons[bite.id] = bite
  b.units[0].lessons.push(bite.id)
  return b
}

beforeEach(() => progressStore.getState().reset())

test('without WebGL, a 3D question becomes a four-name choice that still works (Review Focus 4)', () => {
  render(
    <LanguageProvider>
      <ContentProvider bundle={bundle()}>
        <MemoryRouter initialEntries={['/lesson/u01-b08']}>
          <Routes><Route path="/lesson/:lessonId" element={<LessonScreen />} /></Routes>
        </MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  const options = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
  expect(options).toHaveLength(4)
  fireEvent.click(screen.getByRole('button', { name: 'Cerebellum' }))
  fireEvent.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.getByText(/Nice!/)).toBeInTheDocument()
})

function renderExplorer() {
  return render(
    <LanguageProvider>
      <ContentProvider bundle={bundle()}>
        <MemoryRouter><ExplorerScreen /></MemoryRouter>
      </ContentProvider>
    </LanguageProvider>,
  )
}

test('without WebGL, the Explorer explains and lists the structures', () => {
  renderExplorer()
  expect(screen.getByText(/3D isn't available on this device/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cerebellum' })).toBeInTheDocument()
})

test('the Explorer panel hides undiscovered structures and shows discovered ones', () => {
  progressStore.setState({ discovered: ['cerebellum'] })
  renderExplorer()
  fireEvent.click(screen.getByRole('button', { name: /Brainstem/ }))
  const panel = screen.getByRole('region', { name: 'Structure details' })
  expect(within(panel).getByText('Not discovered yet')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Cerebellum' }))
  expect(within(panel).getByText('Fine-tunes movement.')).toBeInTheDocument()
  expect(within(panel).getByText('Taught in Unit 1')).toBeInTheDocument()
  expect(within(panel).getByText(/FR · 中文: coming soon/)).toBeInTheDocument()
})

test('2D-only structures are listed as such', () => {
  renderExplorer()
  expect(screen.getByText('2D only')).toBeInTheDocument()
  expect(screen.getAllByText('Spinal cord').length).toBeGreaterThan(0)
})

test('without WebGL, the Explore pop-up offers the structures as a list to answer from', async () => {
  const { BrainModal } = await import('./BrainModal')
  render(
    <LanguageProvider>
      <ContentProvider bundle={bundle()}>
        <BrainModal structures={['cerebellum', 'brainstem']} onClose={() => {}} />
      </ContentProvider>
    </LanguageProvider>,
  )
  expect(screen.getByText('Find: Cerebellum')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Brainstem' }))
  expect(screen.getByText("That's the Brainstem. Try again.")).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Cerebellum' }))
  expect(screen.getByText('✓ Cerebellum')).toBeInTheDocument()
})

test('the Explorer shows a colour key for the zones you have met', () => {
  progressStore.setState({ discovered: ['cerebellum', 'brainstem'] })
  renderExplorer()
  const legend = screen.getByRole('list', { name: 'Colour key' })
  expect(within(legend).getByText('Cerebellum')).toBeInTheDocument()
  expect(within(legend).getByText('Brainstem')).toBeInTheDocument()
  expect(within(legend).queryByText('Frontal lobe')).not.toBeInTheDocument()
  expect(screen.getByText('Pale = not discovered yet')).toBeInTheDocument()
})
