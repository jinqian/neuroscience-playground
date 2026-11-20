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

/** The one uniform grey every zone has while it is not in focus. */
export const BASE = '#d5d9e0'

/** Each structure's own colour, used when it is highlighted (others fall back to their unit's colour). */
export const STRUCTURE_COLORS: Record<string, string> = {
  'frontal-lobe': '#1cb0f6',
  'parietal-lobe': '#3dbe5a',
  'temporal-lobe': '#ff8a3d',
  'occipital-lobe': '#ff4b6e',
  cerebellum: '#14b8a6',
  brainstem: '#c04cd9',
  hypothalamus: '#7b5cf0',
}

const FALLBACK = '#9b82ff'

/**
 * The colour a zone is drawn in. The whole brain is one uniform colour; only the zone in focus
 * lights up, in its own colour. (Labels, not colour, show which zones have been met.)
 */
export function zoneColor(structureId: string, state: Exclude<VisualState, 'hidden'>, unitColor = FALLBACK): string {
  if (state !== 'highlight') return BASE
  return STRUCTURE_COLORS[structureId] ?? unitColor
}

/** Mixes a hex colour toward white by `amount` (0–1). */
export function lighten(hex: string, amount: number): string {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return '#' + c.map((v) => Math.round(v + (255 - v) * amount).toString(16).padStart(2, '0')).join('')
}

/** The colour of a zone under the pointer: a lighter tint of the colour it lights up in. */
export function hoverColor(structureId: string, unitColor = FALLBACK): string {
  return lighten(zoneColor(structureId, 'highlight', unitColor), 0.4)
}

export const CORTEX = ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe']
