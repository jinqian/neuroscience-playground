import { render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Structure } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { fixtureBundle } from '../test/fixtures'
import { StructurePicker } from './StructurePicker'
import { resolvePick } from './visual'

const seen: Record<string, unknown>[] = []
vi.mock('./BrainView', () => ({ BrainView: (p: Record<string, unknown>) => { seen.push(p); return null } }))

const t = (en: string) => ({ en })
const structures: Structure[] = [
  { id: 'frontal-lobe', name: t('Frontal lobe'), note: t('n'), units: [], meshNodes: ['frontal-lobe_L'] },
  { id: 'corpus-callosum', name: t('Corpus callosum'), note: t('n'), units: [], meshNodes: ['corpus-callosum'] },
  { id: 'motor-strip', name: t('Motor strip'), note: t('n'), units: [], meshNodes: ['motor-strip_L'], partOf: 'frontal-lobe' },
  { id: 'insula', name: t('Insula'), note: t('n'), units: [], meshNodes: ['insula_L'] },
]

function pickerProps(answer: string, onPick: (id: string) => void = () => {}) {
  seen.length = 0
  render(
    <ContentProvider bundle={{ ...fixtureBundle(), structures }}>
      <LanguageProvider lang="en" onLangChange={() => {}}>
        <StructurePicker answer={answer} seed="q1" onPick={onPick} disabled={false} />
      </LanguageProvider>
    </ContentProvider>,
  )
  return seen.at(-1)!
}

describe('3D structure picker', () => {
  test('a deep target shows a see-through cortex that clicks pass through', () => {
    const p = pickerProps('corpus-callosum')
    expect(p.translucentCortex).toBe(true)
    expect(p.cortexPickable).toBe(false)
  })
  test('a cortex target keeps the cortex solid and tappable', () => {
    const p = pickerProps('frontal-lobe')
    expect(p.translucentCortex).toBe(false)
    expect(p.cortexPickable).toBe(true)
  })
  test('the insula, hidden inside, shows a see-through cortex but stays solid itself', () => {
    const p = pickerProps('insula')
    expect(p.translucentCortex).toBe(true)
    expect(p.keepSolid).toEqual(['insula'])
  })
  test('a surface part of a lobe keeps the cortex solid and tappable', () => {
    const p = pickerProps('motor-strip')
    expect(p.translucentCortex).toBe(false)
    expect(p.cortexPickable).toBe(true)
  })
  test('tapping a part of the target lobe counts as tapping the lobe', () => {
    const got: string[] = []
    const p = pickerProps('frontal-lobe', (id) => got.push(id))
    ;(p.onPick as (id: string) => void)('motor-strip')
    expect(got).toEqual(['frontal-lobe'])
  })
  test('resolvePick keeps the tapped part unless it belongs to the target', () => {
    expect(resolvePick(structures, 'motor-strip', 'motor-strip')).toBe('motor-strip')
    expect(resolvePick(structures, 'motor-strip', 'temporal-lobe')).toBe('motor-strip')
    expect(resolvePick(structures, 'motor-strip', 'frontal-lobe')).toBe('frontal-lobe')
  })
})
