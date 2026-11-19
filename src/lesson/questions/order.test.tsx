import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { expect, test } from 'vitest'
import type { Question } from '../../content/schema'
import type { Response } from '../../engine/check'
import { LanguageProvider } from '../../i18n/LanguageProvider'
import { Order } from './Order'

const t = (en: string) => ({ en })
const q = {
  id: 'q-drag', kind: 'order', prompt: t('Order the flow.'),
  steps: [{ id: 's1', text: t('Dendrite') }, { id: 's2', text: t('Soma') }, { id: 's3', text: t('Axon') }, { id: 's4', text: t('Terminal') }],
  explain: t('In, middle, out.'),
} as Extract<Question, { kind: 'order' }>

function Harness({ disabled = false }: { disabled?: boolean }) {
  const [r, setR] = useState<Response | undefined>({ order: ['s3', 's1', 's4', 's2'] })
  return <LanguageProvider><Order question={q} response={r} onChange={setR} disabled={disabled} /></LanguageProvider>
}

const labels = () => screen.getAllByRole('listitem').map((li) => li.getAttribute('data-label'))

/** jsdom has no layout: give each row a 40px-tall box, stacked every 50px. */
function layout() {
  screen.getAllByRole('listitem').forEach((li, i) => {
    li.getBoundingClientRect = () => ({ top: i * 50, bottom: i * 50 + 40, height: 40, left: 0, right: 300, width: 300, x: 0, y: i * 50, toJSON: () => ({}) })
  })
}

test('dragging an item up moves it to where it is dropped', () => {
  render(<Harness />)
  expect(labels()).toEqual(['Axon', 'Dendrite', 'Terminal', 'Soma'])
  layout()
  const soma = screen.getAllByRole('listitem')[3]
  fireEvent.pointerDown(soma, { pointerId: 1, clientY: 170, button: 0 })
  expect(soma).toHaveClass('order__item--dragging')
  fireEvent.pointerMove(soma, { pointerId: 1, clientY: 60 })
  layout()
  fireEvent.pointerUp(soma, { pointerId: 1, clientY: 60 })
  expect(labels()).toEqual(['Axon', 'Soma', 'Dendrite', 'Terminal'])
  expect(screen.getAllByRole('listitem').some((li) => li.classList.contains('order__item--dragging'))).toBe(false)
})

test('dragging an item down to the bottom', () => {
  render(<Harness />)
  layout()
  const axon = screen.getAllByRole('listitem')[0]
  fireEvent.pointerDown(axon, { pointerId: 1, clientY: 10, button: 0 })
  fireEvent.pointerMove(axon, { pointerId: 1, clientY: 175 })
  fireEvent.pointerUp(axon, { pointerId: 1 })
  expect(labels()).toEqual(['Dendrite', 'Terminal', 'Soma', 'Axon'])
})

test('nothing moves once the answer is checked', () => {
  render(<Harness disabled />)
  layout()
  const axon = screen.getAllByRole('listitem')[0]
  fireEvent.pointerDown(axon, { pointerId: 1, clientY: 10, button: 0 })
  fireEvent.pointerMove(axon, { pointerId: 1, clientY: 175 })
  fireEvent.pointerUp(axon, { pointerId: 1 })
  expect(labels()).toEqual(['Axon', 'Dendrite', 'Terminal', 'Soma'])
})

test('the arrow buttons still work for keyboard users', () => {
  render(<Harness />)
  fireEvent.click(screen.getByRole('button', { name: 'Move Soma up' }))
  expect(labels()).toEqual(['Axon', 'Dendrite', 'Soma', 'Terminal'])
})
