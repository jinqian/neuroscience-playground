import type { FC } from 'react'

export type SimProps = { onGoalMet(): void; goalMet: boolean }

/** Simulations by id, each with its model's TypeScript source for "Peek at the model". */
export const SIMS: Record<string, { Component: FC<SimProps>; modelSource: string }> = {}
