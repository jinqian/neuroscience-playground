import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { ART_TEXT } from './artText'
import { SynapseArt } from './synapse'

const sources = import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const PATTERNS = [/<Label[^>]*>([^<{]+)<\/Label>/g, /\blabel="([^"]+)"/g, /aria-label="([^"]+)"/g, /\blabel: '([^']+)'/g, /className="ion ion--light">([^<]+)</g]

test('every piece of text in the illustrations has a French and Chinese version', () => {
  const missing: string[] = []
  for (const [file, src] of Object.entries(sources)) {
    if (file.endsWith('.test.tsx')) continue
    for (const p of PATTERNS) for (const m of src.matchAll(p)) if (!ART_TEXT[m[1]]) missing.push(`${file}: ${m[1]}`)
  }
  expect(missing).toEqual([])
})

test('an illustration draws its labels in the chosen language', () => {
  render(<LanguageProvider lang="fr" onLangChange={() => {}}><SynapseArt labels /></LanguageProvider>)
  expect(screen.getByRole('img', { name: 'Une synapse chimique' })).toBeInTheDocument()
  expect(screen.getByText('vésicules')).toBeInTheDocument()
})

test('a tappable figure names its regions in the chosen language', () => {
  render(<LanguageProvider lang="zh" onLangChange={() => {}}><SynapseArt onTap={() => {}} /></LanguageProvider>)
  expect(screen.getByRole('button', { name: '囊泡' })).toBeInTheDocument()
})
