import type { FC } from 'react'
import { CNS_PNS_REGIONS, CnsPnsArt } from './cnsPns'
import { GliaArt } from './glia'
import { MeningesArt, MENINGES_REGIONS } from './meninges'
import { MyelinArt } from './myelin'
import { NerveArt } from './nerve'
import { NEURON_REGIONS, NeuronArt } from './neuron'
import { NeuronTypesArt } from './neuronTypes'

export type FigureProps = { onTap(regionId: string): void; highlight?: string; picked?: string }

/** Card illustrations by id. */
export const ILLUSTRATIONS: Record<string, FC> = {
  neuron: () => <NeuronArt labels />,
  'neuron-types': NeuronTypesArt,
  glia: GliaArt,
  myelin: MyelinArt,
  'cns-pns': () => <CnsPnsArt labels />,
  meninges: () => <MeningesArt labels />,
  nerve: NerveArt,
}

/** Tappable figures by id, with the region ids a learner can tap. */
export const FIGURES: Record<string, { Component: FC<FigureProps>; regions: string[] }> = {
  neuron: { Component: (p) => <NeuronArt onTap={p.onTap} picked={p.picked} />, regions: NEURON_REGIONS },
  'cns-pns': { Component: (p) => <CnsPnsArt onTap={p.onTap} picked={p.picked} />, regions: CNS_PNS_REGIONS },
  meninges: { Component: (p) => <MeningesArt onTap={p.onTap} picked={p.picked} />, regions: MENINGES_REGIONS },
}
