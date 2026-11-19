import { load, YAMLException } from 'js-yaml'
import type { z } from 'zod'
import {
  LessonSchema, StructureSchema, TermSchema, UnitSchema,
  type ContentBundle, type ContentError,
} from './schema'

/** Formats a zod issue path like `questions[2].answer`. */
export function formatPath(path: ReadonlyArray<PropertyKey>): string {
  return path.reduce<string>((acc, part) => {
    if (typeof part === 'number') return `${acc}[${part}]`
    return acc ? `${acc}.${String(part)}` : String(part)
  }, '')
}

function zodErrors(file: string, error: z.ZodError, prefix: PropertyKey[] = []): ContentError[] {
  return error.issues.map((i) => ({ file, path: formatPath([...prefix, ...i.path]), message: i.message }))
}

export function parseContent(files: Record<string, string>): { bundle?: ContentBundle; errors: ContentError[] } {
  const errors: ContentError[] = []
  const bundle: ContentBundle = { units: [], lessons: {}, glossary: [], structures: [], sourceFile: {} }

  for (const [file, raw] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    let data: unknown
    try {
      data = load(raw)
    } catch (e) {
      const line = e instanceof YAMLException && e.mark ? ` (line ${e.mark.line + 1})` : ''
      errors.push({ file, path: '', message: `YAML syntax error${line}: ${(e as Error).message.split('\n')[0]}` })
      continue
    }

    if (file.startsWith('content/units/')) {
      const r = UnitSchema.safeParse(data)
      if (!r.success) errors.push(...zodErrors(file, r.error))
      else { bundle.units.push(r.data); bundle.sourceFile[`unit:${r.data.id}`] = file }
    } else if (file.startsWith('content/lessons/')) {
      const r = LessonSchema.safeParse(data)
      if (!r.success) errors.push(...zodErrors(file, r.error))
      else if (bundle.lessons[r.data.id]) errors.push({ file, path: 'id', message: `duplicate lesson id "${r.data.id}"` })
      else { bundle.lessons[r.data.id] = r.data; bundle.sourceFile[`lesson:${r.data.id}`] = file }
    } else if (file === 'content/glossary.yaml') {
      const r = TermSchema.array().safeParse(data ?? [])
      if (!r.success) errors.push(...zodErrors(file, r.error))
      else { bundle.glossary = r.data; bundle.sourceFile.glossary = file }
    } else if (file === 'content/structures.yaml') {
      const r = StructureSchema.array().safeParse(data ?? [])
      if (!r.success) errors.push(...zodErrors(file, r.error))
      else { bundle.structures = r.data; bundle.sourceFile.structures = file }
    } else {
      errors.push({ file, path: '', message: 'unknown content file location' })
    }
  }

  bundle.units.sort((a, b) => a.number - b.number)
  return errors.length ? { errors } : { bundle, errors }
}
