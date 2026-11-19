import type { Structure } from '../content/schema'

export type VisualState = 'highlight' | 'discovered' | 'undiscovered' | 'hidden'
export type Hemisphere = 'both' | 'left' | 'right'

export type VisualContext = {
  discovered: Set<string>
  highlight: string[]
  only?: string[]
  hemisphere: Hemisphere
  /** The mesh node's name, e.g. `frontal-lobe_L`. */
  node: string
}

/** How one mesh node of a structure should be drawn. */
export function visualState(structureId: string, ctx: VisualContext): VisualState {
  if (ctx.only && !ctx.only.includes(structureId)) return 'hidden'
  if (ctx.hemisphere === 'left' && ctx.node.endsWith('_R')) return 'hidden'
  if (ctx.hemisphere === 'right' && ctx.node.endsWith('_L')) return 'hidden'
  if (ctx.highlight.includes(structureId)) return 'highlight'
  if (ctx.discovered.has(structureId)) return 'discovered'
  return 'undiscovered'
}

export function nodeToStructure(structures: Structure[]): Record<string, string> {
  return Object.fromEntries(structures.flatMap((s) => s.meshNodes.map((n) => [n, s.id])))
}

/** Highlight colour for the part in focus. */
export const HIGHLIGHT = '#ffc93c'

/** Each structure's own colour once discovered (others fall back to their unit's colour). */
export const STRUCTURE_COLORS: Record<string, string> = {
  'frontal-lobe': '#1cb0f6',
  'parietal-lobe': '#3dbe5a',
  'temporal-lobe': '#ff8a3d',
  'occipital-lobe': '#ff4b6e',
  cerebellum: '#14b8a6',
  brainstem: '#c04cd9',
  hypothalamus: '#7b5cf0',
}

export const CORTEX = ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe']
