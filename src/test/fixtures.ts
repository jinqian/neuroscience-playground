import type { ContentBundle, Lesson, Unit } from '../content/schema'

const t = (en: string) => ({ en })

export const mcq = (id: string, answer = 'a') => ({
  id, kind: 'mc' as const, prompt: t(`Question ${id}?`),
  options: [{ id: 'a', text: t('Alpha') }, { id: 'b', text: t('Beta') }], answer, explain: t(`Because ${id}.`),
})

export function fixtureBundle(): ContentBundle {
  const lessons: Record<string, Lesson> = {
    'u01-b01': { id: 'u01-b01', type: 'bite', title: t('Meet the neuron'), sources: [], cards: [{ id: 'c1', body: t('A [[soma]].') }], questions: [mcq('q1'), mcq('q2'), mcq('q3'), mcq('q4')] },
    'u01-b02': { id: 'u01-b02', type: 'bite', title: t('No two alike'), sources: [], cards: [{ id: 'c1', body: t('Shapes.') }], questions: [mcq('q1'), mcq('q2'), mcq('q3'), mcq('q4')] },
  }
  const units: Unit[] = [
    { id: 'u01', number: 1, title: t('The Nervous System'), nickname: t('Meet the Cells'), color: '#3DBE5A', module: 'The Nervous System', lessons: ['u01-b01', 'u01-b02'] },
    { id: 'u03', number: 3, title: t('Neuroanatomy'), nickname: t('Brain Map'), color: '#FF8A3D', module: 'Neuroanatomy', lessons: [] },
  ]
  return {
    units, lessons,
    glossary: [{ id: 'soma', en: 'soma', roots: 'Greek sōma, body', unit: 'u01' }],
    structures: [{ id: 'spinal-cord', name: t('Spinal cord'), note: t('The cable.'), units: ['u01'], meshNodes: [], twoDOnly: true }],
    sourceFile: {},
  }
}
