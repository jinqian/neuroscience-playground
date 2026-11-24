import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { Lang } from '../../i18n/lang'
import { LanguageProvider } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { SLOTS } from './model'
import { FlatMapSim } from './FlatMapSim'

const NAMES: Record<string, string> = {
  'spinal-cord': 'Spinal cord', medulla: 'Medulla', pons: 'Pons', cerebellum: 'Cerebellum', midbrain: 'Midbrain',
  thalamus: 'Thalamus', hypothalamus: 'Hypothalamus', frontal: 'Frontal lobe', parietal: 'Parietal lobe', temporal: 'Temporal lobe', occipital: 'Occipital lobe',
}

const setup = (goalMet = false) => {
  const onGoalMet = vi.fn()
  const ui = (l: Lang) => <LanguageProvider lang={l} onLangChange={() => {}}><FlatMapSim onGoalMet={onGoalMet} goalMet={goalMet} /></LanguageProvider>
  const r = render(ui('en'))
  const bank = () => screen.getByRole('group', { name: t('flatmapBank', 'en') })
  const slot = (i: number) => screen.getByRole('button', { name: new RegExp(`^${t('fmSlot', 'en', { n: i + 1 })}\\b`) })
  const put = (label: string, slotIndex: number) => {
    fireEvent.click(within(bank()).getByRole('button', { name: NAMES[label] }))
    fireEvent.click(slot(slotIndex))
  }
  return { onGoalMet, bank, slot, put, switchTo: (l: Lang) => r.rerender(ui(l)) }
}

describe('flat map sim', () => {
  test('the bank holds all 11 labels', () => {
    const { bank } = setup()
    expect(within(bank()).getAllByRole('button')).toHaveLength(11)
  })

  test('tapping a label then its slot places it', () => {
    const { bank, slot, put } = setup()
    put('pons', SLOTS.indexOf('pons'))
    expect(slot(SLOTS.indexOf('pons'))).toHaveAccessibleName(`${t('fmSlot', 'en', { n: 3 })}: Pons`)
    expect(within(bank()).queryByRole('button', { name: 'Pons' })).toBeNull()
  })

  test('a label put too low gets a "higher" hint and is not placed', () => {
    const { bank, put, onGoalMet } = setup()
    put('thalamus', SLOTS.indexOf('medulla'))
    expect(screen.getByRole('status')).toHaveTextContent(t('flatmapHintHigher', 'en', { label: 'Thalamus' }))
    expect(within(bank()).getByRole('button', { name: 'Thalamus' })).toBeInTheDocument()
    expect(onGoalMet).not.toHaveBeenCalled()
  })

  test('placing all 11 reaches the goal once', () => {
    const { put, onGoalMet } = setup()
    SLOTS.forEach((s, i) => put(s, i))
    expect(onGoalMet).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.sim__readout')).toHaveTextContent('11')
  })

  test('coming back after the goal shows the finished map', () => {
    const { bank, slot } = setup(true)
    expect(within(bank()).queryAllByRole('button')).toHaveLength(0)
    expect(slot(0)).toHaveAccessibleName(`${t('fmSlot', 'en', { n: 1 })}: Spinal cord`)
  })

  test('switching language keeps placements and renames the labels', () => {
    const { put, switchTo } = setup()
    put('pons', SLOTS.indexOf('pons'))
    switchTo('fr')
    expect(screen.getByRole('button', { name: `${t('fmSlot', 'fr', { n: 3 })}: ${t('fmPons', 'fr')}` })).toBeInTheDocument()
  })

  test("a lobe put on another lobe's spot is told where the lobes go", () => {
    const { put } = setup()
    put('frontal', SLOTS.indexOf('occipital'))
    expect(screen.getByRole('status')).toHaveTextContent(t('flatmapHintLobe', 'en', { label: 'Frontal lobe' }))
  })
})
