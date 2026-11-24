import type { FC } from 'react'
import { ActionPotentialArt } from './actionPotential'
import { AUTONOMIC_REGIONS, AutonomicArt } from './autonomic'
import { CNS_PNS_REGIONS, CnsPnsArt } from './cnsPns'
import { CortexFoldingArt } from './cortexFolding'
import { FlatMapArt } from './flatMap'
import { FOREBRAIN_TRACT_REGIONS, ForebrainTractsArt } from './forebrainTracts'
import { GliaArt } from './glia'
import { LATERAL_REGIONS, LateralBrainArt } from './lateralBrain'
import { MeningesArt, MENINGES_REGIONS } from './meninges'
import { MembraneArt } from './membrane'
import { MyelinArt } from './myelin'
import { NerveArt } from './nerve'
import { NeuralTubeArt } from './neuralTube'
import { NEURON_REGIONS, NeuronArt } from './neuron'
import { NeuronTypesArt } from './neuronTypes'
import { ReceptorsArt } from './receptors'
import { SPINAL_LEVEL_REGIONS, SpinalLevelsArt } from './spinalLevels'
import { SynapseArt, SYNAPSE_REGIONS } from './synapse'
import { TUBE_DEFECT_REGIONS, TubeDefectsArt } from './tubeDefects'
import { VesiclesArt } from './vesicles'

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
  membrane: MembraneArt,
  'action-potential': ActionPotentialArt,
  synapse: () => <SynapseArt labels />,
  receptors: ReceptorsArt,
  autonomic: () => <AutonomicArt labels />,
  'spinal-levels': () => <SpinalLevelsArt labels />,
  vesicles: () => <VesiclesArt labels />,
  'neural-tube': NeuralTubeArt,
  'tube-defects': () => <TubeDefectsArt labels />,
  'cortex-folding': CortexFoldingArt,
  'forebrain-tracts': () => <ForebrainTractsArt labels />,
  'flat-map': FlatMapArt,
  'lateral-brain': () => <LateralBrainArt labels />,
}

/** Tappable figures by id, with the region ids a learner can tap. */
export const FIGURES: Record<string, { Component: FC<FigureProps>; regions: string[] }> = {
  neuron: { Component: (p) => <NeuronArt onTap={p.onTap} picked={p.picked} />, regions: NEURON_REGIONS },
  'cns-pns': { Component: (p) => <CnsPnsArt onTap={p.onTap} picked={p.picked} />, regions: CNS_PNS_REGIONS },
  meninges: { Component: (p) => <MeningesArt onTap={p.onTap} picked={p.picked} />, regions: MENINGES_REGIONS },
  'forebrain-tracts': { Component: (p) => <ForebrainTractsArt onTap={p.onTap} picked={p.picked} />, regions: FOREBRAIN_TRACT_REGIONS },
  'lateral-brain': { Component: (p) => <LateralBrainArt onTap={p.onTap} picked={p.picked} />, regions: LATERAL_REGIONS },
  'tube-defects': { Component: (p) => <TubeDefectsArt onTap={p.onTap} picked={p.picked} />, regions: TUBE_DEFECT_REGIONS },
  synapse: { Component: (p) => <SynapseArt onTap={p.onTap} picked={p.picked} />, regions: SYNAPSE_REGIONS },
  autonomic: { Component: (p) => <AutonomicArt onTap={p.onTap} picked={p.picked} />, regions: AUTONOMIC_REGIONS },
  'spinal-levels': { Component: (p) => <SpinalLevelsArt onTap={p.onTap} picked={p.picked} />, regions: SPINAL_LEVEL_REGIONS },
}
