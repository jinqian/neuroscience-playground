import { render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import type { Structure } from '../content/schema'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { fixtureBundle } from '../test/fixtures'
import { StructurePicker } from './StructurePicker'

const seen: Record<string, unknown>[] = []
vi.mock('./BrainView', () => ({ BrainView: (p: Record<string, unknown>) => { seen.push(p); return null } }))

const t = (en: string) => ({ en })
const structures: Structure[] = [
  { id: 'frontal-lobe', name: t('Frontal lobe'), note: t('n'), units: [], meshNodes: ['frontal-lobe_L'] },
  { id: 'corpus-callosum', name: t('Corpus callosum'), note: t('n'), units: [], meshNodes: ['corpus-callosum'] },
]

function pickerProps(answer: string) {
  seen.length = 0
  render(
    <ContentProvider bundle={{ ...fixtureBundle(), structures }}>
      <LanguageProvider lang="en" onLangChange={() => {}}>
        <StructurePicker answer={answer} seed="q1" onPick={() => {}} disabled={false} />
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
})
