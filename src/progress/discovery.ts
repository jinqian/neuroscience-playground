import { isRichField, parseRich } from '../content/richText'
import type { Lesson, Question } from '../content/schema'

const unique = (xs: string[]) => [...new Set(xs)]

function questionsOf(lesson: Lesson): Question[] {
  if (lesson.type === 'bite') return lesson.questions
  if (lesson.type === 'lab') return lesson.reflection
  return lesson.clues.flatMap((c) => (c.unlock ? [c.unlock] : []))
}

/** 3D structures a learner meets in this lesson. */
export function lessonStructures(lesson: Lesson): string[] {
  const cards = lesson.type === 'bite' ? lesson.cards : lesson.type === 'lab' ? lesson.intro : []
  const out = cards.flatMap((c) => c.explore3d ?? [])
  for (const q of questionsOf(lesson)) if (q.kind === 'tap3d') out.push(q.structure)
  if (lesson.type === 'case' && lesson.final.kind === 'tap3d') out.push(lesson.final.answer)
  return unique(out)
}

/** Glossary terms a learner meets in this lesson (from rich text and term-match questions). */
export function lessonTerms(lesson: Lesson): string[] {
  const out: string[] = []
  const walk = (node: unknown, path: string, key: string, parentKey: string) => {
    if (Array.isArray(node)) { node.forEach((n, i) => walk(n, `${path}[${i}]`, key, parentKey)); return }
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (typeof obj.en === 'string' && isRichField(path, key, parentKey)) {
      for (const l of ['en', 'fr', 'zh']) {
        const text = obj[l]
        if (typeof text === 'string') for (const s of parseRich(text)) if (s.kind === 'term') out.push(s.termId)
      }
    }
    for (const [k, v] of Object.entries(obj)) if (v && typeof v === 'object') walk(v, path ? `${path}.${k}` : k, k, key)
  }
  walk(lesson, '', '', '')
  for (const q of questionsOf(lesson)) if (q.kind === 'termmatch') out.push(...q.terms)
  return unique(out)
}
