import type { FC } from 'react'
import { MyelinSim } from '../sims/myelin/MyelinSim'
import { ThresholdSim } from '../sims/threshold/ThresholdSim'
import { FlatMapSim } from '../sims/flatmap/FlatMapSim'
import { LesionSim } from '../sims/lesion/LesionSim'
import { UnfoldingSim } from '../sims/unfolding/UnfoldingSim'
import type { SimProps } from './types'

export type { SimProps } from './types'

/** Simulations by id. */
export const SIMS: Record<string, { Component: FC<SimProps> }> = {
  threshold: { Component: ThresholdSim },
  myelin: { Component: MyelinSim },
  unfolding: { Component: UnfoldingSim },
  flatmap: { Component: FlatMapSim },
  lesion: { Component: LesionSim },
}
