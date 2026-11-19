import type { FC } from 'react'
import thresholdSource from '../sims/threshold/model.ts?raw'
import { ThresholdSim } from '../sims/threshold/ThresholdSim'
import type { SimProps } from './types'

export type { SimProps } from './types'

/** Simulations by id, each with its model's TypeScript source for "Peek at the model". */
export const SIMS: Record<string, { Component: FC<SimProps>; modelSource: string }> = {
  threshold: { Component: ThresholdSim, modelSource: thresholdSource },
}
