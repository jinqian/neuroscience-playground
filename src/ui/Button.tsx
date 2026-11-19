import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

export function Button({ variant = 'primary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`btn btn--${variant} ${className}`} {...rest} />
}

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong'

/** A chunky answer button. */
export function OptionButton({ state = 'idle', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { state?: OptionState }) {
  return (
    <button
      type="button"
      className={`option ${state !== 'idle' ? `option--${state}` : ''} ${className}`}
      aria-pressed={state === 'selected'}
      {...rest}
    />
  )
}
