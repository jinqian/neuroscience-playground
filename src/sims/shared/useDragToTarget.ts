import { useRef, useState, type PointerEvent } from 'react'

/** A press that moves further than this (px) is a drag, not a tap. */
const DRAG_PX = 8

type Pressed<I> = { item: I; x: number; y: number; dx: number; dy: number; moved: boolean }

/** The target under the pointer (an element with `data-target`), looking past the dragged item on top of it. */
function targetAt<T extends string>(x: number, y: number): T | null {
  const stack = document.elementsFromPoint?.(x, y) ?? [document.elementFromPoint?.(x, y)]
  for (const el of stack) {
    const t = el?.closest<HTMLElement>('[data-target]')?.dataset.target
    if (t) return t as T
  }
  return null
}

/**
 * Drag an item (a button) onto a target (any element with `data-target`).
 * The dragged item follows the pointer; the target under it is reported as `over`.
 * A plain press without movement is left to the item's own click (tap-then-tap still works).
 */
export function useDragToTarget<I extends string, T extends string>(onDrop: (item: I, target: T) => void) {
  const [pressed, setPressed] = useState<Pressed<I> | null>(null)
  const [over, setOver] = useState<T | null>(null)
  /** The item a drag just ended on: its trailing click must not count as a tap. */
  const justDragged = useRef<I | null>(null)

  const end = (e: PointerEvent<HTMLElement>, dropIt: boolean) => {
    const p = pressed
    setPressed(null)
    setOver(null)
    if (!p?.moved) return
    justDragged.current = p.item
    const target = dropIt ? targetAt<T>(e.clientX, e.clientY) : null
    if (target) onDrop(p.item, target)
  }

  const handlers = (item: I) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      e.currentTarget.setPointerCapture?.(e.pointerId)
      justDragged.current = null
      setPressed({ item, x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false })
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!pressed || pressed.item !== item) return
      const dx = e.clientX - pressed.x
      const dy = e.clientY - pressed.y
      const moved = pressed.moved || Math.hypot(dx, dy) > DRAG_PX
      setPressed({ ...pressed, dx, dy, moved })
      setOver(moved ? targetAt<T>(e.clientX, e.clientY) : null)
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => end(e, true),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => end(e, false),
  })

  /** Call first in the item's onClick: true when this click only ends a drag and must be ignored. */
  const swallowClick = (item: I) => {
    const fromDrag = justDragged.current === item
    justDragged.current = null
    return fromDrag
  }

  const drag = pressed?.moved ? { item: pressed.item, dx: pressed.dx, dy: pressed.dy } : null
  return { drag, over, handlers, swallowClick }
}
