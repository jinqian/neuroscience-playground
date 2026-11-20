import { ENABLED_LANGUAGES } from '../config'
import { FIGURES, ILLUSTRATIONS } from '../illustrations/registry'
import { SIMS } from '../lab/registry'
import { NEURON_PART_IDS } from '../neuron/parts'
import type { ValidateOptions } from './validate'

/** Validator options derived from what the app actually has registered. */
export function registryOptions(): ValidateOptions {
  return {
    enabled: ENABLED_LANGUAGES,
    figures: Object.fromEntries(Object.entries(FIGURES).map(([id, f]) => [id, f.regions])),
    illustrations: Object.keys(ILLUSTRATIONS),
    sims: Object.keys(SIMS),
    neuronParts: [...NEURON_PART_IDS],
  }
}
