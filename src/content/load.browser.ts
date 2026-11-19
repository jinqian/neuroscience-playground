import { parseContent } from './parse'
import { registryOptions } from './registries'
import type { ContentBundle, ContentError } from './schema'
import { validateContent } from './validate'

const raw = import.meta.glob('/content/**/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/** Parses and validates every YAML file under content/ (bundled at build time). */
export function loadBrowserContent(): { bundle?: ContentBundle; errors: ContentError[] } {
  const files = Object.fromEntries(Object.entries(raw).map(([path, text]) => [path.replace(/^\//, ''), text]))
  const { bundle, errors } = parseContent(files)
  if (!bundle) return { errors }
  const problems = validateContent(bundle, registryOptions())
  return problems.length ? { errors: problems } : { bundle, errors: [] }
}
