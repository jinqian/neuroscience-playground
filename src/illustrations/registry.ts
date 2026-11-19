import type { FC } from 'react'

export type FigureProps = { onTap(regionId: string): void; highlight?: string; picked?: string }

/** Card illustrations by id. */
export const ILLUSTRATIONS: Record<string, FC> = {}

/** Tappable figures by id, with the region ids a learner can tap. */
export const FIGURES: Record<string, { Component: FC<FigureProps>; regions: string[] }> = {}
