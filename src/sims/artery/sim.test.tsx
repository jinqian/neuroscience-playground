import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { Lang } from '../../i18n/lang'
import { LanguageProvider } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { ArterySim } from './ArterySim'
import { PATIENTS } from './model'

const ARTERY_KEY = { aca: 'arteryAca', mca: 'arteryMca', pca: 'arteryPca' } as const
const SIDE_KEY = { left: 'sideLeft', right: 'sideRight' } as const

const setup = (goalMet = false) => {
  const onGoalMet = vi.fn()
  const ui = (l: Lang) => <LanguageProvider lang={l} onLangChange={() => {}}><ArterySim onGoalMet={onGoalMet} goalMet={goalMet} /></LanguageProvider>
  const r = render(ui('en'))
  const choose = (artery: keyof typeof ARTERY_KEY, side: keyof typeof SIDE_KEY) => {
    fireEvent.click(screen.getByRole('button', { name: t(ARTERY_KEY[artery], 'en') }))
    fireEvent.click(screen.getByRole('button', { name: t(SIDE_KEY[side], 'en') }))
  }
  const block = (artery: keyof typeof ARTERY_KEY, side: keyof typeof SIDE_KEY) => {
    choose(artery, side)
    fireEvent.click(screen.getByRole('button', { name: t('blockedHere', 'en') }))
  }
  return { onGoalMet, choose, block, switchTo: (l: Lang) => r.rerender(ui(l)) }
}

describe('block-an-artery sim', () => {
  test('it starts on the first patient', () => {
    setup()
    expect(screen.getByText(t('arteryP1', 'en'))).toBeInTheDocument()
  })

  test('choosing an artery shows what a block would cause', () => {
    const { choose } = setup()
    choose('mca', 'left')
    expect(screen.getByText(t('blockMcaLeft', 'en'))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t('arteryMca', 'en') })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(t('arteryP1', 'en'))).toBeInTheDocument()
  })

  test('the wrong side explains itself', () => {
    const { block } = setup()
    block('aca', 'left')
    expect(screen.getByRole('status')).toHaveTextContent(t('missSide', 'en'))
    expect(screen.getByText(t('arteryP1', 'en'))).toBeInTheDocument()
  })

  test('a wrong artery explains itself', () => {
    const { block } = setup()
    block('mca', 'right')
    expect(screen.getByRole('status')).toHaveTextContent(t('missMca', 'en'))
  })

  test('the right artery and side moves on to the next patient', () => {
    const { block } = setup()
    block('aca', 'right')
    expect(screen.getByRole('status')).toHaveTextContent(t('solvedP1', 'en'))
    expect(screen.getByText(t('arteryP2', 'en'))).toBeInTheDocument()
  })

  test('solving all three reaches the goal once', () => {
    const { block, onGoalMet } = setup()
    for (const p of PATIENTS) block(p.artery, p.side)
    expect(onGoalMet).toHaveBeenCalledTimes(1)
    expect(screen.getByText(t('arteryAllSolved', 'en'))).toBeInTheDocument()
  })

  test('coming back after the goal shows all solved', () => {
    setup(true)
    expect(screen.getByText(t('arteryAllSolved', 'en'))).toBeInTheDocument()
    expect(screen.getByText(t('solvedCount', 'en', { n: 3, total: 3 }))).toBeInTheDocument()
  })

  test('it works in French', () => {
    const { switchTo } = setup()
    switchTo('fr')
    expect(screen.getByText(t('arteryP1', 'fr'))).toBeInTheDocument()
  })
})
