import type { Lesson, Unit } from '../content/schema'

export type NodeState = 'done' | 'current' | 'open' | 'locked'

/**
 * A non-Case node unlocks when every Bite before it in the unit is completed (Labs never gate).
 * The Case unlocks when all Bites in the unit are completed. `current` is the first unlocked node not yet done.
 */
export function nodeStates(unit: Unit, lessons: Record<string, Lesson>, completed: Set<string>): Record<string, NodeState> {
  const out: Record<string, NodeState> = {}
  const bites = unit.lessons.filter((id) => lessons[id]?.type === 'bite')
  let currentSet = false
  unit.lessons.forEach((id, i) => {
    const lesson = lessons[id]
    const gate = lesson?.type === 'case' ? bites : unit.lessons.slice(0, i).filter((b) => lessons[b]?.type === 'bite')
    const unlocked = gate.every((b) => completed.has(b))
    let state: NodeState = completed.has(id) ? 'done' : unlocked ? 'open' : 'locked'
    if (state === 'open' && !currentSet) { state = 'current'; currentSet = true }
    out[id] = state
  })
  return out
}
