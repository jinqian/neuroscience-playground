import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { Lang } from '../../i18n/lang'
import { LanguageProvider } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { UnfoldingSim } from './UnfoldingSim'

const setup = (lang: Lang = 'en', goalMet = false) => {
  const onGoalMet = vi.fn()
  const ui = (l: Lang) => <LanguageProvider lang={l} onLangChange={() => {}}><UnfoldingSim onGoalMet={onGoalMet} goalMet={goalMet} /></LanguageProvider>
  const r = render(ui(lang))
  const slider = screen.getByLabelText(t('stageLabel', 'en'))
  const toStage = (i: number) => fireEvent.change(slider, { target: { value: String(i) } })
  const board = () => screen.queryByRole('group', { name: t('matchPrompt', 'en') })
  const tap = (name: string) => fireEvent.click(within(board()!).getByRole('button', { name }))
  return { onGoalMet, toStage, board, tap, switchTo: (l: Lang) => r.rerender(ui(l)) }
}

describe('unfolding sim', () => {
  test('there is nothing to match before the five-vesicle stage', () => {
    const { board, toStage } = setup()
    expect(board()).toBeNull()
    toStage(3)
    expect(board()).toBeNull()
  })

  test('at the five-vesicle stage there are five vesicles and five targets', () => {
    const { board, toStage } = setup()
    toStage(4)
    expect(within(board()!).getAllByRole('button')).toHaveLength(10)
  })

  test('tapping a vesicle then the right target matches it, without reaching the goal yet', () => {
    const { board, toStage, tap, onGoalMet } = setup()
    toStage(4)
    tap('Telencephalon')
    tap('Cerebral hemispheres')
    expect(within(board()!).getByRole('button', { name: 'Telencephalon' })).toHaveAttribute('data-matched', 'true')
    expect(onGoalMet).not.toHaveBeenCalled()
  })

  test('a wrong target gives a hint and keeps the vesicle unmatched', () => {
    const { board, toStage, tap, onGoalMet } = setup()
    toStage(4)
    tap('Mesencephalon')
    tap('Medulla')
    expect(screen.getByRole('status')).toHaveTextContent('Mesencephalon')
    expect(within(board()!).getByRole('button', { name: 'Mesencephalon' })).not.toHaveAttribute('data-matched', 'true')
    expect(onGoalMet).not.toHaveBeenCalled()
  })

  test('matching all five reaches the goal once', () => {
    const { toStage, tap, onGoalMet } = setup()
    toStage(4)
    const pairs = [
      ['Telencephalon', 'Cerebral hemispheres'], ['Diencephalon', 'Thalamus and hypothalamus'], ['Mesencephalon', 'Midbrain'],
      ['Metencephalon', 'Pons and cerebellum'], ['Myelencephalon', 'Medulla'],
    ]
    for (const [v, target] of pairs) { tap(v); tap(target) }
    expect(onGoalMet).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.sim__readout')).toHaveTextContent('5')
  })

  test('switching language keeps the matches and renames the vesicles', () => {
    const { toStage, tap, switchTo } = setup()
    toStage(4)
    tap('Telencephalon')
    tap('Cerebral hemispheres')
    switchTo('fr')
    const board = screen.getByRole('group', { name: t('matchPrompt', 'fr') })
    expect(within(board).getByRole('button', { name: 'Télencéphale' })).toHaveAttribute('data-matched', 'true')
  })

  test('dragging a vesicle moves it with the pointer and lights up the target under it', () => {
    const { board, toStage } = setup()
    toStage(4)
    const ves = within(board()!).getByRole('button', { name: 'Telencephalon' })
    const target = within(board()!).getByRole('button', { name: 'Cerebral hemispheres' })
    document.elementFromPoint = () => target
    fireEvent.pointerDown(ves, { pointerId: 1, clientX: 0, clientY: 0, button: 0 })
    fireEvent.pointerMove(ves, { pointerId: 1, clientX: 50, clientY: 60 })
    expect(ves).toHaveClass('unfold__ves--dragging')
    expect(ves.style.transform).toBe('translate(50px, 60px)')
    expect(target).toHaveClass('unfold__tgt--over')
    fireEvent.pointerUp(ves, { pointerId: 1, clientX: 50, clientY: 60 })
    expect(ves).toHaveAttribute('data-matched', 'true')
    expect(ves).not.toHaveClass('unfold__ves--dragging')
  })

  test('after a drag, the next plain tap on another vesicle still selects it', () => {
    const { board, toStage } = setup()
    toStage(4)
    const ves = within(board()!).getByRole('button', { name: 'Telencephalon' })
    document.elementFromPoint = () => within(board()!).getByRole('button', { name: 'Cerebral hemispheres' })
    fireEvent.pointerDown(ves, { pointerId: 1, clientX: 0, clientY: 0, button: 0 })
    fireEvent.pointerMove(ves, { pointerId: 1, clientX: 50, clientY: 60 })
    fireEvent.pointerUp(ves, { pointerId: 1, clientX: 50, clientY: 60 })
    const next = within(board()!).getByRole('button', { name: 'Diencephalon' })
    fireEvent.click(next)
    expect(next).toHaveAttribute('aria-pressed', 'true')
  })

  test('coming back after the goal was reached shows the finished board', () => {
    const { board } = setup('en', true)
    const vesicles = within(board()!).getAllByRole('button').filter((b) => b.classList.contains('unfold__ves'))
    expect(vesicles).toHaveLength(5)
    for (const v of vesicles) expect(v).toHaveAttribute('data-matched', 'true')
  })

  test('a drop counts even though the dragged vesicle sits on top of the target', () => {
    const { board, toStage } = setup()
    toStage(4)
    const ves = within(board()!).getByRole('button', { name: 'Diencephalon' })
    const target = within(board()!).getByRole('button', { name: 'Thalamus and hypothalamus' })
    document.elementFromPoint = () => ves
    document.elementsFromPoint = () => [ves, target, document.body]
    fireEvent.pointerDown(ves, { pointerId: 1, clientX: 0, clientY: 0, button: 0 })
    fireEvent.pointerMove(ves, { pointerId: 1, clientX: 300, clientY: 0 })
    fireEvent.pointerUp(ves, { pointerId: 1, clientX: 300, clientY: 0 })
    expect(ves).toHaveAttribute('data-matched', 'true')
  })
})
