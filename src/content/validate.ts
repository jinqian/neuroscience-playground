import type { Lang } from '../i18n/lang'
import { hasBrokenMarkup, isRichField, parseRich, wordCount } from './richText'
import type { Card, CaseFinal, ContentBundle, ContentError, Lesson, Question } from './schema'

export type ValidateOptions = {
  enabled: Lang[]
  /** figure id → its tappable region ids */
  figures: Record<string, string[]>
  illustrations: string[]
  sims: string[]
}

const MAX_CARD_WORDS = 80

export function validateContent(bundle: ContentBundle, opts: ValidateOptions): ContentError[] {
  const errors: ContentError[] = []
  const err = (file: string, path: string, message: string) => errors.push({ file, path, message })

  const termIds = new Set(bundle.glossary.map((t) => t.id))
  const structureIds = new Set(bundle.structures.map((s) => s.id))
  const unitIds = new Set(bundle.units.map((u) => u.id))
  const glossaryFile = bundle.sourceFile.glossary ?? 'content/glossary.yaml'
  const structuresFile = bundle.sourceFile.structures ?? 'content/structures.yaml'

  // ---- generic walk: every LText has every enabled language; rich text only names known terms ----
  function walk(file: string, node: unknown, path: string, key: string, parentKey = '') {
    if (Array.isArray(node)) {
      node.forEach((child, i) => walk(file, child, `${path}[${i}]`, key, parentKey))
      return
    }
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (typeof obj.en === 'string') {
      const missing = opts.enabled.filter((l) => typeof obj[l] !== 'string' || obj[l] === '')
      if (missing.length) err(file, path, `missing ${missing.map((l) => `"${l}"`).join(', ')}`)
      const rich = isRichField(path, key, parentKey)
      for (const l of ['en', 'fr', 'zh'] as const) {
        const text = obj[l]
        if (typeof text !== 'string' || key === 'wiki') continue
        if (!rich) {
          if (/\[\[|\]\]|\*\*/.test(text)) err(file, `${path}.${l}`, 'markup is shown as plain text here; remove [[…]] and **…**')
          continue
        }
        if (hasBrokenMarkup(text)) err(file, `${path}.${l}`, 'malformed term markup: use [[term-id]] or [[term-id|text]] with lowercase letters, digits and dashes')
        for (const seg of parseRich(text)) {
          if (seg.kind === 'term' && !termIds.has(seg.termId)) err(file, `${path}.${l}`, `unknown term "${seg.termId}"`)
        }
      }
    }
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object') walk(file, v, path ? `${path}.${k}` : k, k, key)
    }
  }

  function dupes(file: string, items: { id: string }[], path: (i: number) => string, what: string) {
    const seen = new Set<string>()
    items.forEach((it, i) => {
      if (seen.has(it.id)) err(file, path(i), `duplicate ${what} id "${it.id}"`)
      seen.add(it.id)
    })
  }

  // ---- units ----
  dupes('content/units', bundle.units, () => 'id', 'unit')
  const listed = new Set<string>()
  for (const u of bundle.units) {
    const file = bundle.sourceFile[`unit:${u.id}`]
    walk(file, u, '', '')
    u.lessons.forEach((lid, i) => {
      listed.add(lid)
      const lesson = bundle.lessons[lid]
      if (!lesson) err(file, `lessons[${i}]`, `unknown lesson "${lid}"`)
      else if (lesson.type === 'case' && i !== u.lessons.length - 1) err(file, `lessons[${i}]`, 'a Case must be the last lesson of its unit')
    })
  }

  // ---- glossary ----
  dupes(glossaryFile, bundle.glossary, (i) => `[${i}].id`, 'term')
  bundle.glossary.forEach((t, i) => {
    walk(glossaryFile, t, `[${i}]`, '')
    if (!unitIds.has(t.unit)) err(glossaryFile, `[${i}].unit`, `unknown unit "${t.unit}"`)
  })

  // ---- structures ----
  dupes(structuresFile, bundle.structures, (i) => `[${i}].id`, 'structure')
  bundle.structures.forEach((s, i) => {
    walk(structuresFile, s, `[${i}]`, '')
    s.units.forEach((u, j) => { if (!unitIds.has(u)) err(structuresFile, `[${i}].units[${j}]`, `unknown unit "${u}"`) })
  })

  // ---- lessons ----
  for (const lesson of Object.values(bundle.lessons)) {
    const file = bundle.sourceFile[`lesson:${lesson.id}`]
    if (!listed.has(lesson.id)) err(file, 'id', `lesson "${lesson.id}" is not listed in any unit`)
    walk(file, lesson, '', '')
    checkLesson(file, lesson)
  }

  function checkCard(file: string, c: Card, p: string) {
    if (c.illustration && !opts.illustrations.includes(c.illustration)) err(file, `${p}.illustration`, `unknown illustration "${c.illustration}"`)
    c.explore3d?.forEach((s, j) => { if (!structureIds.has(s)) err(file, `${p}.explore3d[${j}]`, `unknown structure "${s}"`) })
    const n = wordCount(c.body.en)
    if (n > MAX_CARD_WORDS) err(file, `${p}.body.en`, `${n} words (max ${MAX_CARD_WORDS})`)
  }

  function count(file: string, path: string, n: number, min: number, max: number, what: string) {
    if (n < min || n > max) err(file, path, `needs ${min}–${max} ${what}, has ${n}`)
  }

  function checkOptions(file: string, ids: string[], p: string, field: string) {
    const seen = new Set<string>()
    ids.forEach((id, j) => {
      if (seen.has(id)) err(file, `${p}.${field}[${j}].id`, `duplicate id "${id}"`)
      seen.add(id)
    })
  }

  function checkQuestion(file: string, q: Question, p: string) {
    switch (q.kind) {
      case 'mc':
      case 'gap':
        checkOptions(file, q.options.map((o) => o.id), p, 'options')
        if (!q.options.some((o) => o.id === q.answer)) err(file, `${p}.answer`, `answer "${q.answer}" is not one of the options`)
        if (q.kind === 'gap') {
          for (const l of opts.enabled) {
            const text = q.prompt[l]
            if (typeof text === 'string' && text.split('___').length !== 2) err(file, `${p}.prompt.${l}`, 'must contain exactly one ___')
          }
        }
        break
      case 'order':
        checkOptions(file, q.steps.map((s) => s.id), p, 'steps')
        break
      case 'match':
        checkOptions(file, q.pairs.map((s) => s.id), p, 'pairs')
        break
      case 'tfwhy':
        checkOptions(file, q.reasons.map((r) => r.id), p, 'reasons')
        if (!q.reasons.some((r) => r.id === q.answerReason)) err(file, `${p}.answerReason`, `answerReason "${q.answerReason}" is not one of the reasons`)
        break
      case 'tap2d': {
        const regions = opts.figures[q.figure]
        if (!regions) err(file, `${p}.figure`, `unknown figure "${q.figure}"`)
        else if (!regions.includes(q.answer)) err(file, `${p}.answer`, `answer "${q.answer}" is not a region of figure "${q.figure}"`)
        break
      }
      case 'tap3d':
        if (!structureIds.has(q.structure)) err(file, `${p}.structure`, `unknown structure "${q.structure}"`)
        break
      case 'termmatch':
        q.terms.forEach((t, j) => { if (!termIds.has(t)) err(file, `${p}.terms[${j}]`, `unknown term "${t}"`) })
        for (const side of ['from', 'to'] as const) {
          if (!opts.enabled.includes(q[side])) err(file, `${p}.${side}`, `language "${q[side]}" is not enabled`)
        }
        break
    }
  }

  function checkQuestions(file: string, qs: { q: Question; p: string }[]) {
    const seen = new Set<string>()
    for (const { q, p } of qs) {
      if (seen.has(q.id)) err(file, `${p}.id`, `duplicate question id "${q.id}"`)
      seen.add(q.id)
      checkQuestion(file, q, p)
    }
  }

  function checkFinal(file: string, f: CaseFinal) {
    let candidates: string[] = []
    if (f.kind === 'choice') {
      if (!f.options?.length) { err(file, 'final.options', 'a choice final needs options'); return }
      candidates = f.options.map((o) => o.id)
    } else if (f.kind === 'tap2d') {
      const regions = f.figure ? opts.figures[f.figure] : undefined
      if (!regions) { err(file, 'final.figure', `unknown figure "${f.figure ?? ''}"`); return }
      candidates = regions
    } else {
      if (!f.candidates?.length) { err(file, 'final.candidates', 'a tap3d final needs candidates'); return }
      f.candidates.forEach((s, j) => { if (!structureIds.has(s)) err(file, `final.candidates[${j}]`, `unknown structure "${s}"`) })
      candidates = f.candidates
    }
    if (!candidates.includes(f.answer)) err(file, 'final.answer', `answer "${f.answer}" is not one of the choices`)
    const missing = candidates.filter((c) => !f.explanations[c])
    if (missing.length) err(file, 'final.explanations', `missing explanation for ${missing.map((m) => `"${m}"`).join(', ')}`)
  }

  function checkLesson(file: string, lesson: Lesson) {
    if (lesson.type === 'bite') {
      count(file, 'cards', lesson.cards.length, 1, 3, 'cards')
      count(file, 'questions', lesson.questions.length, 4, 8, 'questions')
      dupes(file, lesson.cards, (i) => `cards[${i}].id`, 'card')
      lesson.cards.forEach((c, i) => checkCard(file, c, `cards[${i}]`))
      checkQuestions(file, lesson.questions.map((q, i) => ({ q, p: `questions[${i}]` })))
    } else if (lesson.type === 'lab') {
      count(file, 'intro', lesson.intro.length, 1, 2, 'intro cards')
      count(file, 'reflection', lesson.reflection.length, 2, 3, 'reflection questions')
      if (!opts.sims.includes(lesson.sim)) err(file, 'sim', `unknown sim "${lesson.sim}"`)
      dupes(file, lesson.intro, (i) => `intro[${i}].id`, 'card')
      lesson.intro.forEach((c, i) => checkCard(file, c, `intro[${i}]`))
      checkQuestions(file, lesson.reflection.map((q, i) => ({ q, p: `reflection[${i}]` })))
    } else {
      dupes(file, lesson.clues, (i) => `clues[${i}].id`, 'clue')
      const qs: { q: Question; p: string }[] = []
      lesson.clues.forEach((c, i) => { if (c.unlock) qs.push({ q: c.unlock, p: `clues[${i}].unlock` }) })
      checkQuestions(file, qs)
      checkFinal(file, lesson.final)
    }
  }

  return errors
}
