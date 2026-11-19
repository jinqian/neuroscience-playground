import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { LanguageProvider } from '../../i18n/LanguageProvider'
import { ThresholdSim } from './ThresholdSim'
import { MyelinSim } from '../myelin/MyelinSim'

test('sim readouts are plain feedback panels, not a terminal', () => {
  for (const Sim of [ThresholdSim, MyelinSim]) {
    const { container, unmount } = render(<LanguageProvider><Sim onGoalMet={() => {}} goalMet={false} /></LanguageProvider>)
    expect(container.querySelector('.sim__console')).toBeNull()
    expect(container.querySelector('.sim__readout')).not.toBeNull()
    unmount()
  }
})
