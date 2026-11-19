import { z } from 'zod'

const id = z.string().min(1)
const lang = z.enum(['en', 'fr', 'zh'])

export const LTextSchema = z.strictObject({ en: z.string().min(1), fr: z.string().optional(), zh: z.string().optional() })

const OptionSchema = z.strictObject({ id, text: LTextSchema })

export const CardSchema = z.strictObject({
  id,
  body: LTextSchema,
  illustration: z.string().optional(),
  dev: z.strictObject({ analogy: LTextSchema, breaks: LTextSchema }).optional(),
  explore3d: z.array(z.string()).optional(),
  verify: z.boolean().optional(),
})

const common = { id, explain: LTextSchema, verify: z.boolean().optional() }

export const QuestionSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...common, kind: z.literal('mc'), prompt: LTextSchema, options: z.array(OptionSchema).min(2).max(4), answer: id }),
  z.strictObject({ ...common, kind: z.literal('gap'), prompt: LTextSchema, options: z.array(OptionSchema).min(2).max(4), answer: id }),
  z.strictObject({ ...common, kind: z.literal('order'), prompt: LTextSchema, steps: z.array(OptionSchema).min(3).max(6) }),
  z.strictObject({
    ...common, kind: z.literal('match'), prompt: LTextSchema,
    pairs: z.array(z.strictObject({ id, left: LTextSchema, right: LTextSchema })).min(3).max(5),
  }),
  z.strictObject({
    ...common, kind: z.literal('tfwhy'), statement: LTextSchema, isTrue: z.boolean(),
    reasons: z.array(OptionSchema).min(2).max(4), answerReason: id,
  }),
  z.strictObject({ ...common, kind: z.literal('tap2d'), prompt: LTextSchema, figure: id, answer: id }),
  z.strictObject({ ...common, kind: z.literal('tap3d'), prompt: LTextSchema, structure: id }),
  z.strictObject({
    id, verify: z.boolean().optional(), explain: LTextSchema.optional(),
    kind: z.literal('termmatch'), terms: z.array(id).min(3).max(5), from: lang, to: lang,
  }),
])

const lessonBase = { id, title: LTextSchema, sources: z.array(z.string()) }

export const BiteSchema = z.strictObject({
  ...lessonBase, type: z.literal('bite'), cards: z.array(CardSchema), questions: z.array(QuestionSchema),
})

export const LabSchema = z.strictObject({
  ...lessonBase, type: z.literal('lab'), intro: z.array(CardSchema), sim: id,
  goal: LTextSchema, simplified: LTextSchema, reflection: z.array(QuestionSchema),
})

export const CaseFinalSchema = z.strictObject({
  prompt: LTextSchema,
  kind: z.enum(['choice', 'tap2d', 'tap3d']),
  options: z.array(OptionSchema).optional(),
  figure: z.string().optional(),
  candidates: z.array(z.string()).optional(),
  answer: id,
  explanations: z.record(z.string(), LTextSchema),
})

export const CaseSchema = z.strictObject({
  ...lessonBase, type: z.literal('case'), story: LTextSchema,
  clues: z.array(z.strictObject({ id, text: LTextSchema, unlock: QuestionSchema.optional(), verify: z.boolean().optional() })).min(1),
  final: CaseFinalSchema,
  solved: LTextSchema,
})

export const LessonSchema = z.discriminatedUnion('type', [BiteSchema, LabSchema, CaseSchema])

export const UnitSchema = z.strictObject({
  id, number: z.number().int().positive(), title: LTextSchema, nickname: LTextSchema,
  color: z.string(), module: z.string(), lessons: z.array(id),
})

export const TermSchema = z.strictObject({
  id, en: z.string().min(1), fr: z.string().optional(), zh: z.string().optional(),
  roots: z.string().optional(), abbr: z.string().optional(), unit: id,
})

export const StructureSchema = z.strictObject({
  id, name: LTextSchema, note: LTextSchema, units: z.array(id), meshNodes: z.array(z.string()), twoDOnly: z.boolean().optional(),
})

export type Option = z.infer<typeof OptionSchema>
export type Card = z.infer<typeof CardSchema>
export type Question = z.infer<typeof QuestionSchema>
export type QuestionKind = Question['kind']
export type Bite = z.infer<typeof BiteSchema>
export type Lab = z.infer<typeof LabSchema>
export type Case = z.infer<typeof CaseSchema>
export type CaseFinal = z.infer<typeof CaseFinalSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Unit = z.infer<typeof UnitSchema>
export type Term = z.infer<typeof TermSchema>
export type Structure = z.infer<typeof StructureSchema>

export type ContentBundle = {
  units: Unit[]
  lessons: Record<string, Lesson>
  glossary: Term[]
  structures: Structure[]
  /** Where each item came from, for error messages: keys `unit:<id>`, `lesson:<id>`, `glossary`, `structures`. */
  sourceFile: Record<string, string>
}

export type ContentError = { file: string; path: string; message: string }
