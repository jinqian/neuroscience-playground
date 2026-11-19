import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../ui/App'
import { fixtureBundle } from '../test/fixtures'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { CreditsScreen } from './CreditsScreen'

test('credits give the exact BodyParts3D attribution and license', () => {
  render(<LanguageProvider><CreditsScreen /></LanguageProvider>)
  expect(screen.getByText('BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /CC BY-SA 2\.1 JP/ })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en')
  expect(screen.getByText(/SIL Open Font License/)).toBeInTheDocument()
})

test('the app shell links to the credits page', () => {
  render(<App loaded={{ bundle: fixtureBundle(), errors: [] }} />)
  expect(screen.getByRole('link', { name: 'Credits' })).toHaveAttribute('href', '#/credits')
})
