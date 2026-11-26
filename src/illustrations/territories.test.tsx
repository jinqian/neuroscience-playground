import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { TERRITORY_REGIONS, TerritoriesTopArt, TerritoryViewsArt } from './territories'

const wrap = (ui: React.ReactNode) => render(<LanguageProvider lang="en" onLangChange={() => {}}>{ui}</LanguageProvider>)

describe('artery territories', () => {
  test('the view from above offers six named territories', () => {
    wrap(<TerritoriesTopArt onTap={() => {}} />)
    expect(TERRITORY_REGIONS).toHaveLength(6)
    expect(screen.getAllByRole('button')).toHaveLength(6)
    expect(screen.getByRole('button', { name: 'Left middle cerebral artery territory' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Right anterior cerebral artery territory' })).toBeInTheDocument()
  })

  test('the lit territory is the only full-colour one', () => {
    const { container } = wrap(<TerritoryViewsArt lit="mca" />)
    const areas = [...container.querySelectorAll('[data-artery]')]
    expect(areas.length).toBeGreaterThan(3)
    for (const a of areas) expect(a.getAttribute('data-lit')).toBe(a.getAttribute('data-artery') === 'mca' ? 'true' : 'false')
  })

  test('with nothing lit, every territory is full colour', () => {
    const { container } = wrap(<TerritoryViewsArt />)
    for (const a of container.querySelectorAll('[data-artery]')) expect(a.getAttribute('data-lit')).toBe('true')
  })
})
