import { render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { ContentProvider } from '../content/ContentProvider'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { fixtureBundle } from '../test/fixtures'
import { TermPopover } from './TermPopover'

afterEach(() => vi.restoreAllMocks())

function openAt(left: number, width: number) {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(400)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left, right: left + width, top: 0, bottom: 100, width, height: 100, x: left, y: 0, toJSON() {} } as DOMRect)
  render(<LanguageProvider><ContentProvider bundle={fixtureBundle()}><TermPopover termId="soma" onClose={() => {}} /></ContentProvider></LanguageProvider>)
  return screen.getByRole('dialog')
}

test('a popover that would run off the right edge shifts back on screen', () => {
  const pop = openAt(300, 250)
  expect(pop.style.left).toBe('-158px')
})

test('a popover that fits stays where it is', () => {
  const pop = openAt(20, 250)
  expect(pop.style.left).toBe('')
})

test('measuring twice (as React does in development) keeps the shift', () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const left = 376 + (parseFloat(this.style.left) || 0)
    return { left, right: left + 197.17, top: 0, bottom: 100, width: 197.17, height: 100, x: left, y: 0, toJSON() {} } as DOMRect
  })
  render(<StrictMode><LanguageProvider><ContentProvider bundle={fixtureBundle()}><TermPopover termId="soma" onClose={() => {}} /></ContentProvider></LanguageProvider></StrictMode>)
  expect(screen.getByRole('dialog').style.left).toBe('-82px')
})
