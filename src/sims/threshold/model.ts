/**
 * A teaching model of a neuron's membrane voltage after one quick stimulus.
 *
 * It is NOT a Hodgkin–Huxley simulation: the spike is a fixed shape, drawn
 * whenever the voltage reaches threshold. That's enough to show the two big
 * ideas of this lab: there is a threshold, and a spike is all-or-none.
 */

export const REST = -70 // mV: resting potential, kept by the Na⁺/K⁺ pump
export const THRESHOLD = -55 // mV: where voltage-gated Na⁺ channels open
export const PEAK = 40 // mV: top of the spike (Na⁺ rushed in)
export const AHP = -80 // mV: after-hyperpolarisation (K⁺ rushed out)
const TAU = 3 // ms: how fast the membrane drifts back to rest

export type Trace = Array<[timeMs: number, voltageMv: number]>

export function simulate(
  stimulusMv: number,
  { durationMs = 30, stepMs = 0.1, stimAtMs = 5 } = {},
): { trace: Trace; fired: boolean } {
  const fired = REST + stimulusMv >= THRESHOLD
  const trace: Trace = []
  for (let i = 0; i * stepMs <= durationMs + 1e-9; i++) {
    const t = i * stepMs
    trace.push([t, voltageAt(t - stimAtMs, stimulusMv, fired)])
  }
  return { trace, fired }
}

/** Voltage `dt` ms after the stimulus. */
function voltageAt(dt: number, stimulusMv: number, fired: boolean): number {
  if (dt < 0) return REST

  if (!fired) {
    // Below threshold: a small bump that leaks away.
    return REST + stimulusMv * Math.exp(-dt / TAU)
  }

  // Above threshold: the same spike every time.
  const kick = REST + stimulusMv
  if (dt < 0.5) return REST + (kick - REST) * (dt / 0.5) // stimulus pushes up
  if (dt < 1.5) return kick + (PEAK - kick) * ((dt - 0.5) / 1.0) // Na⁺ channels open: rise
  if (dt < 3) return PEAK + (AHP - PEAK) * ((dt - 1.5) / 1.5) // K⁺ channels open: fall
  return AHP + (REST - AHP) * (1 - Math.exp(-(dt - 3) / TAU)) // recover to rest
}

/** The smallest whole-number stimulus that makes the neuron fire. */
export function minimumFiringStimulus(): number {
  let s = 0
  while (!simulate(s).fired) s++
  return s
}
