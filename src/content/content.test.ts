import { dump } from 'js-yaml'
import { describe, expect, test } from 'vitest'
import type { Lang } from '../i18n/lang'
import { parseContent } from './parse'
import { parseRich } from './richText'
import { validateContent } from './validate'

// ---------- fixture ----------
type Obj = Record<string, any>

function fixture(): Record<string, Obj | Obj[]> {
  return {
    'content/units/u01.yaml': {
      id: 'u01', number: 1, title: { en: 'The Nervous System' }, nickname: { en: 'Meet the Cells' },
      color: '#3DBE5A', module: 'The Nervous System', lessons: ['u01-b01', 'u01-lab-x', 'u01-case-x'],
    },
    'content/lessons/u01/u01-b01.yaml': {
      id: 'u01-b01', type: 'bite', title: { en: 'Meet the neuron' }, sources: ['Parts of the Neuron'],
      cards: [{ id: 'c1', body: { en: 'The [[soma]] is the **cell body**.' }, illustration: 'neuron-art', explore3d: ['spinal-cord'] }],
      questions: [
        { id: 'q1', kind: 'mc', prompt: { en: 'Which part receives input?' },
          options: [{ id: 'a', text: { en: 'Dendrites' } }, { id: 'b', text: { en: 'Axon' } }], answer: 'a', explain: { en: 'Dendrites are the inbox.' } },
        { id: 'q2', kind: 'gap', prompt: { en: 'The cell body is the ___.' },
          options: [{ id: 'a', text: { en: 'soma' } }, { id: 'b', text: { en: 'axon' } }], answer: 'a', explain: { en: 'Soma means body.' } },
        { id: 'q3', kind: 'tap2d', prompt: { en: 'Tap the soma.' }, figure: 'neuron', answer: 'soma', explain: { en: 'The round middle.' } },
        { id: 'q4', kind: 'tap3d', prompt: { en: 'Find the spinal cord.' }, structure: 'spinal-cord', explain: { en: 'Below the brainstem.' } },
      ],
    },
    'content/lessons/u01/u01-lab-x.yaml': {
      id: 'u01-lab-x', type: 'lab', title: { en: 'Threshold' }, sources: ['Action Potential'],
      intro: [{ id: 'c1', body: { en: 'Find the threshold.' } }], sim: 'threshold',
      goal: { en: 'Find the smallest stimulus that fires.' }, simplified: { en: 'Not Hodgkin–Huxley.' },
      reflection: [
        { id: 'q1', kind: 'tfwhy', statement: { en: 'Bigger stimuli give bigger spikes.' }, isTrue: false,
          reasons: [{ id: 'r1', text: { en: 'All-or-none.' } }, { id: 'r2', text: { en: 'Ohm.' } }], answerReason: 'r1', explain: { en: 'Same height.' } },
        { id: 'q2', kind: 'order', prompt: { en: 'Order the steps.' },
          steps: [{ id: 's1', text: { en: 'Na in' } }, { id: 's2', text: { en: 'K out' } }, { id: 's3', text: { en: 'Rest' } }], explain: { en: 'Up, down, rest.' } },
      ],
    },
    'content/lessons/u01/u01-case-x.yaml': {
      id: 'u01-case-x', type: 'case', title: { en: 'Tingling feet' }, sources: ['Myelin'],
      story: { en: 'A patient has tingling feet.' },
      clues: [
        { id: 'k1', text: { en: 'Started in the feet.' } },
        { id: 'k2', text: { en: 'Brain MRI normal.' }, unlock: {
          id: 'q1', kind: 'match', prompt: { en: 'Match.' },
          pairs: [{ id: 'p1', left: { en: 'CNS' }, right: { en: 'oligodendrocyte' } },
                  { id: 'p2', left: { en: 'PNS' }, right: { en: 'Schwann cell' } },
                  { id: 'p3', left: { en: 'Immune' }, right: { en: 'microglia' } }], explain: { en: 'Myelin makers.' } } },
      ],
      final: { prompt: { en: 'Whose myelin?' }, kind: 'choice',
        options: [{ id: 'a', text: { en: 'Schwann cells' } }, { id: 'b', text: { en: 'Oligodendrocytes' } }], answer: 'a',
        explanations: { a: { en: 'Yes, PNS.' }, b: { en: 'That is CNS.' } } },
      solved: { en: 'Solved: [[soma]] safe.' },
    },
    'content/glossary.yaml': [
      { id: 'soma', en: 'soma', roots: 'Greek soma, body', unit: 'u01', wiki: { en: 'https://en.wikipedia.org/wiki/Soma_(biology)' } },
      { id: 'action-potential', en: 'action potential', unit: 'u01', wiki: { en: 'https://en.wikipedia.org/wiki/Action_potential' } },
    ],
    'content/structures.yaml': [
      { id: 'spinal-cord', name: { en: 'Spinal cord' }, note: { en: 'The cable to the body.' }, units: ['u01'], meshNodes: [], twoDOnly: true },
    ],
  }
}

const opts = (enabled: Lang[] = ['en']) => ({
  enabled,
  figures: { neuron: ['soma', 'axon'] },
  illustrations: ['neuron-art'],
  sims: ['threshold'],
})

function toFiles(f: Record<string, Obj | Obj[]>): Record<string, string> {
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, dump(v)]))
}

function run(mutate: (f: Record<string, any>) => void = () => {}, enabled: Lang[] = ['en']) {
  const f = fixture()
  mutate(f)
  const { bundle, errors } = parseContent(toFiles(f))
  if (errors.length) return errors
  return validateContent(bundle!, opts(enabled))
}

/** Adds a French copy to every LText-like object (anything with a string `en`). */
function addFr(node: any): void {
  if (Array.isArray(node)) node.forEach(addFr)
  else if (node && typeof node === 'object') {
    if (typeof node.en === 'string') node.fr = node.en.startsWith('https://en.wikipedia.org/') ? node.en.replace('https://en.', 'https://fr.') : 'fr:' + node.en
    Object.values(node).forEach(addFr)
  }
}

const B = 'content/lessons/u01/u01-b01.yaml'
const L = 'content/lessons/u01/u01-lab-x.yaml'
const C = 'content/lessons/u01/u01-case-x.yaml'
const U = 'content/units/u01.yaml'

// ---------- tests ----------
describe('parseRich', () => {
  test('splits text, bold and terms', () => {
    expect(parseRich('A **big** [[action-potential]] and [[soma|cell body]].')).toEqual([
      { kind: 'text', text: 'A ' },
      { kind: 'bold', text: 'big' },
      { kind: 'text', text: ' ' },
      { kind: 'term', termId: 'action-potential' },
      { kind: 'text', text: ' and ' },
      { kind: 'term', termId: 'soma', label: 'cell body' },
      { kind: 'text', text: '.' },
    ])
  })
})

describe('valid content', () => {
  test('parses and validates with no errors', () => {
    expect(run()).toEqual([])
  })
  test('parses with French present when FR is enabled', () => {
    expect(run((f) => addFr(f), ['en', 'fr'])).toEqual([])
  })
})

describe('validator rules (one error each)', () => {
  const cases: Array<[string, (f: Record<string, any>) => void, { file: string; path: string; msg: string }, Lang[]?]> = [
    ['1 missing enabled language', (f) => { addFr(f); delete f[B].cards[0].body.fr },
      { file: B, path: 'cards[0].body', msg: 'missing "fr"' }, ['en', 'fr']],
    ['2 duplicate local id', (f) => { f[B].questions[1].id = 'q1' },
      { file: B, path: 'questions[1].id', msg: 'duplicate' }],
    ['3 unit lists a missing lesson', (f) => { f[U].lessons.splice(1, 0, 'u01-b99') },
      { file: U, path: 'lessons[1]', msg: 'u01-b99' }],
    ['4 answer is not an option', (f) => { f[B].questions[0].answer = 'z' },
      { file: B, path: 'questions[0].answer', msg: '"z"' }],
    ['5 unknown term in rich text', (f) => { f[B].cards[0].body.en = 'The [[somma]] is here.' },
      { file: B, path: 'cards[0].body.en', msg: 'somma' }],
    ['6 unknown structure', (f) => { f[B].cards[0].explore3d = ['spinal-chord'] },
      { file: B, path: 'cards[0].explore3d[0]', msg: 'spinal-chord' }],
    ['7 unknown illustration', (f) => { f[B].cards[0].illustration = 'nope' },
      { file: B, path: 'cards[0].illustration', msg: 'nope' }],
    ['7 unknown figure', (f) => { f[B].questions[2].figure = 'brainz' },
      { file: B, path: 'questions[2].figure', msg: 'brainz' }],
    ['7 unknown sim', (f) => { f[L].sim = 'warp' },
      { file: L, path: 'sim', msg: 'warp' }],
    ['8 too few bite questions', (f) => { f[B].questions.pop() },
      { file: B, path: 'questions', msg: '4–8' }],
    ['9 card over 80 words', (f) => { f[B].cards[0].body.en = Array(81).fill('word').join(' ') },
      { file: B, path: 'cards[0].body.en', msg: '81 words' }],
    ['10 termmatch language not enabled', (f) => {
      f[B].questions.push({ id: 'q5', kind: 'termmatch', terms: ['soma', 'action-potential', 'soma'], from: 'en', to: 'fr' })
      f[B].questions[4].terms = ['soma', 'action-potential', 'soma']
    }, { file: B, path: 'questions[4].to', msg: '"fr"' }],
    ['11 case final missing an explanation', (f) => { delete f[C].final.explanations.b },
      { file: C, path: 'final.explanations', msg: '"b"' }],
    ['12 gap without blank', (f) => { f[B].questions[1].prompt.en = 'The cell body is the soma.' },
      { file: B, path: 'questions[1].prompt.en', msg: '___' }],
    ['13 case is not last', (f) => { f[U].lessons = ['u01-case-x', 'u01-b01', 'u01-lab-x'] },
      { file: U, path: 'lessons[0]', msg: 'last' }],
  ]
  test.each(cases)('rule %s', (_name, mutate, want, enabled) => {
    const errors = run(mutate, enabled ?? ['en'])
    expect(errors).toHaveLength(1)
    expect(errors[0].file).toBe(want.file)
    expect(errors[0].path).toBe(want.path)
    expect(errors[0].message).toContain(want.msg)
  })
})

describe('parse errors', () => {
  test('bad YAML reports the file and line', () => {
    const files = toFiles(fixture())
    files[B] = 'id: u01-b01\ntype: bite\n  title: oops\n'
    const { errors } = parseContent(files)
    expect(errors).toHaveLength(1)
    expect(errors[0].file).toBe(B)
    expect(errors[0].message).toMatch(/line \d+/)
  })
  test('a term without a Wikipedia link is an error', () => {
    const f = fixture()
    delete (f['content/glossary.yaml'] as Obj[])[0].wiki
    const { errors } = parseContent(toFiles(f))
    expect(errors).toEqual([expect.objectContaining({ file: 'content/glossary.yaml', path: '[0].wiki' })])
  })
  test('a Wikipedia link must be a wikipedia.org URL', () => {
    const f = fixture()
    ;(f['content/glossary.yaml'] as Obj[])[0].wiki = { en: 'https://example.com/soma' }
    const { errors } = parseContent(toFiles(f))
    expect(errors).toEqual([expect.objectContaining({ path: '[0].wiki.en' })])
  })
  test('developer analogy boxes are no longer allowed on cards', () => {
    const f = fixture()
    ;(f[B] as Obj).cards[0].dev = { analogy: { en: 'x' }, breaks: { en: 'y' } }
    const { errors } = parseContent(toFiles(f))
    expect(errors).toHaveLength(1)
    expect(errors[0].file).toBe(B)
  })
  test('schema mismatch reports the field path', () => {
    const f = fixture()
    delete (f[B] as Obj).title
    const { errors } = parseContent(toFiles(f))
    expect(errors).toEqual([expect.objectContaining({ file: B, path: 'title' })])
  })
})
