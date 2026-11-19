import { useEffect, useRef, useState } from 'react'
import type { SimProps } from '../../lab/types'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { AHP, minimumFiringStimulus, PEAK, REST, simulate, THRESHOLD } from './model'

const V_MIN = AHP - 10
const V_MAX = PEAK + 10

function draw(canvas: HTMLCanvasElement, stimulus: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width: w, height: h } = canvas
  const { trace } = simulate(stimulus)
  const tMax = trace[trace.length - 1][0]
  const x = (t: number) => 36 + (t / tMax) * (w - 46)
  const y = (v: number) => h - 14 - ((v - V_MIN) / (V_MAX - V_MIN)) * (h - 28)

  ctx.clearRect(0, 0, w, h)
  ctx.font = '700 12px Nunito, system-ui, sans-serif'
  for (const [v, color, dash] of [[REST, '#5a5288', []], [THRESHOLD, '#ffd479', [5, 5]], [0, '#2e2850', [2, 4]]] as const) {
    ctx.strokeStyle = color
    ctx.setLineDash([...dash])
    ctx.beginPath(); ctx.moveTo(36, y(v)); ctx.lineTo(w - 10, y(v)); ctx.stroke()
    ctx.fillStyle = color
    ctx.fillText(`${v}`, 2, y(v) + 4)
  }
  ctx.setLineDash([])
  ctx.strokeStyle = '#ff5fa8'
  ctx.lineWidth = 3
  ctx.beginPath()
  trace.forEach(([t, v], i) => (i ? ctx.lineTo(x(t), y(v)) : ctx.moveTo(x(t), y(v))))
  ctx.stroke()
  ctx.lineWidth = 1
}

export function ThresholdSim({ onGoalMet, goalMet }: SimProps) {
  const { lang } = useLang()
  const [stimulus, setStimulus] = useState(8)
  const [guess, setGuess] = useState('')
  const [wrong, setWrong] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const { fired } = simulate(stimulus)

  useEffect(() => { if (canvas.current) draw(canvas.current, stimulus) }, [stimulus])

  const checkGuess = () => {
    const ok = Number(guess) === minimumFiringStimulus()
    setWrong(!ok)
    if (ok) onGoalMet()
  }

  return (
    <div className="sim">
      <label className="sim__label" htmlFor="stimulus">
        <span>{t('stimulus', lang)}</span>
        <b>+{stimulus} mV</b>
      </label>
      <input id="stimulus" type="range" min={1} max={30} value={stimulus} onChange={(e) => setStimulus(Number(e.target.value))} />
      <canvas ref={canvas} className="sim__canvas" width={600} height={220} aria-label="Membrane voltage over 30 milliseconds" />
      <div className="sim__legend">
        <span><i style={{ background: '#ff5fa8' }} />Vm</span>
        <span><i style={{ background: '#ffd479' }} />{t('thresholdLine', lang)} −55 mV</span>
        <span><i style={{ background: '#5a5288' }} />{t('restLine', lang)} −70 mV</span>
      </div>
      <p className="sim__readout" aria-live="polite">
        {t(fired ? 'fires' : 'fizzles', lang, { s: stimulus, v: REST + stimulus })}
      </p>
      <div className="sim__answer">
        <label htmlFor="threshold-guess">{t('myAnswer', lang)}</label>
        <div className="sim__answer-row">
          <input id="threshold-guess" className="input input--dark" type="number" inputMode="numeric" value={guess} disabled={goalMet}
            onChange={(e) => { setGuess(e.target.value); setWrong(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') checkGuess() }} />
          <button type="button" className="btn btn--primary" disabled={goalMet || guess === ''} onClick={checkGuess}>{t('check', lang)}</button>
        </div>
        {wrong && <p className="sim__wrong">{t('thresholdWrong', lang)}</p>}
      </div>
    </div>
  )
}
