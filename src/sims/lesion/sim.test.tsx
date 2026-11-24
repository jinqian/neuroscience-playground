import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { Lang } from '../../i18n/lang'
import { LanguageProvider } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { CASES } from './model'
import { LesionSim } from './LesionSim'

/** Accessible names of the tappable zones in the side-view figure (English). */
const ZONE_NAME: Record<string, string> = {
  prefrontal: 'Prefrontal cortex', 'motor-strip': 'Motor strip', broca: "Broca's area", 'sensory-strip': 'Sensory strip',
  'parietal-association': 'Parietal association cortex', wernicke: "Wernicke's area", auditory: 'Auditory cortex',
  visual: 'Visual cortex', cerebellum: 'Cerebellum', brainstem: 'Brainstem',
}

const setup = (goalMet = false) => {
  const onGoalMet = vi.fn()
  const ui = (l: Lang) => <LanguageProvider lang={l} onLangChange={() => {}}><LesionSim onGoalMet={onGoalMet} goalMet={goalMet} /></LanguageProvider>
  const r = render(ui('en'))
  const tap = (zone: string) => fireEvent.click(screen.getByRole('button', { name: ZONE_NAME[zone] }))
  return { onGoalMet, tap, switchTo: (l: Lang) => r.rerender(ui(l)) }
}

describe('lesion localizer sim', () => {
  test('it starts on the first patient', () => {
    setup()
    expect(screen.getByText(t('lesionC1', 'en'))).toBeInTheDocument()
  })

  test('a wrong zone explains itself and stays on the same patient', () => {
    const { tap } = setup()
    tap('wernicke')
    expect(screen.getByRole('status')).toHaveTextContent(t('whyWernicke', 'en'))
    expect(screen.getByText(t('lesionC1', 'en'))).toBeInTheDocument()
  })

  test('the right zone moves on to the next patient', () => {
    const { tap } = setup()
    tap('broca')
    expect(screen.getByText(t('lesionC2', 'en'))).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(t('solvedC1', 'en'))
  })

  test('a right-hemisphere case shows the right hemisphere', () => {
    const { tap } = setup()
    tap('broca')
    tap('wernicke')
    expect(screen.getByText(t('lesionC3', 'en'))).toBeInTheDocument()
    expect(document.querySelector('svg[data-side]')).toHaveAttribute('data-side', 'right')
  })

  test('solving all six reaches the goal once', () => {
    const { tap, onGoalMet } = setup()
    for (const c of CASES) tap(c.answer)
    expect(onGoalMet).toHaveBeenCalledTimes(1)
    expect(screen.getByText(t('lesionAllSolved', 'en'))).toBeInTheDocument()
  })

  test('coming back after the goal shows that all patients are solved', () => {
    setup(true)
    expect(screen.getByText(t('lesionAllSolved', 'en'))).toBeInTheDocument()
    expect(document.querySelector('.sim__readout')).toHaveTextContent('6')
  })

  test('switching language re-renders the patient', () => {
    const { switchTo } = setup()
    switchTo('zh')
    expect(screen.getByText(t('lesionC1', 'zh'))).toBeInTheDocument()
  })
})
