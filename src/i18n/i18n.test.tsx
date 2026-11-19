import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { pick } from './lang'
import { t } from './t'
import { LanguageProvider } from './LanguageProvider'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('pick', () => {
  test('falls back to English when the language is missing', () => {
    expect(pick({ en: 'neuron' }, 'fr')).toBe('neuron')
  })
  test('returns the requested language when present', () => {
    expect(pick({ en: 'a', fr: 'b' }, 'fr')).toBe('b')
  })
})

test('t interpolates variables', () => {
  expect(t('xpGained', 'en', { n: 10 })).toBe('+10 XP')
})

test('switcher shows EN active and FR/中文 disabled as coming soon', () => {
  render(
    <LanguageProvider>
      <LanguageSwitcher />
    </LanguageProvider>,
  )
  const en = screen.getByRole('button', { name: 'EN' })
  const fr = screen.getByRole('button', { name: 'FR' })
  const zh = screen.getByRole('button', { name: '中文' })
  expect(en).toHaveAttribute('aria-pressed', 'true')
  expect(fr).toBeDisabled()
  expect(zh).toBeDisabled()
  expect(fr).toHaveAttribute('title', 'Coming soon')
  expect(zh).toHaveAttribute('title', 'Coming soon')
})
