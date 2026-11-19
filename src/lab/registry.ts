import type { FC } from 'react'
import { MyelinSim } from '../sims/myelin/MyelinSim'
import { ThresholdSim } from '../sims/threshold/ThresholdSim'
import type { SimProps } from './types'

export type { SimProps } from './types'

/** Simulations by id. */
export const SIMS: Record<string, { Component: FC<SimProps> }> = {
  threshold: { Component: ThresholdSim },
  myelin: { Component: MyelinSim },
}
