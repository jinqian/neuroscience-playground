import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { expect, test } from 'vitest'
import { parseContent } from '../src/content/parse'
import { registryOptions } from '../src/content/registries'
import { validateContent } from '../src/content/validate'

const root = join(__dirname, '..')

function yamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return yamlFiles(p)
    return p.endsWith('.yaml') ? [p] : []
  })
}

test('the real content folder parses and validates with zero errors', () => {
  const files = Object.fromEntries(
    yamlFiles(join(root, 'content')).map((p) => [relative(root, p).split('\\').join('/'), readFileSync(p, 'utf8')]),
  )
  const { bundle, errors } = parseContent(files)
  const all = bundle ? [...errors, ...validateContent(bundle, registryOptions())] : errors
  const report = all.map((e) => `${e.file} — ${e.path}: ${e.message}`).join('\n')
  expect(report).toBe('')
})
