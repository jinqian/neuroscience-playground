import { useState } from 'react'
import { OptionButton } from '../../ui/Button'

type Item = { id: string; label: string }

const PAIR_COLORS = ['#1cb0f6', '#ff8a3d', '#9b82ff', '#14b8a6', '#ff4b6e']

/** Two columns; tap a left item, then a right item, to pair them. Used by match and term-match. */
export function PairBoard({ left, right, pairs, onChange, disabled }: {
  left: Item[]; right: Item[]; pairs: Record<string, string>; onChange(p: Record<string, string>): void; disabled: boolean
}) {
  const [active, setActive] = useState<string | null>(null)
  const colorOf = (leftId: string) => PAIR_COLORS[left.findIndex((l) => l.id === leftId) % PAIR_COLORS.length]
  const leftFor = (rightId: string) => Object.keys(pairs).find((k) => pairs[k] === rightId)

  const pickRight = (rightId: string) => {
    if (!active) return
    const next = Object.fromEntries(Object.entries(pairs).filter(([k, v]) => k !== active && v !== rightId))
    next[active] = rightId
    onChange(next)
    setActive(null)
  }

  return (
    <div className="pairs">
      <div className="pairs__col">
        {left.map((l) => (
          <OptionButton
            key={l.id}
            state={active === l.id ? 'selected' : 'idle'}
            disabled={disabled}
            onClick={() => setActive(l.id)}
            style={pairs[l.id] ? { borderColor: colorOf(l.id) } : undefined}
          >
            {pairs[l.id] && <span className="pairs__dot" style={{ background: colorOf(l.id) }} aria-hidden="true" />}
            {l.label}
          </OptionButton>
        ))}
      </div>
      <div className="pairs__col">
        {right.map((r) => {
          const owner = leftFor(r.id)
          return (
            <OptionButton
              key={r.id}
              disabled={disabled || !active}
              onClick={() => pickRight(r.id)}
              style={owner ? { borderColor: colorOf(owner) } : undefined}
            >
              {owner && <span className="pairs__dot" style={{ background: colorOf(owner) }} aria-hidden="true" />}
              {r.label}
            </OptionButton>
          )
        })}
      </div>
    </div>
  )
}
