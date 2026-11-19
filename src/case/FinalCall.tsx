import type { Case } from '../content/schema'
import { FIGURES } from '../illustrations/registry'
import { pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { StructureChoice } from '../lesson/questions/StructureChoice'
import { OptionButton } from '../ui/Button'

type Props = { lesson: Case; picked?: string; correct?: boolean; disabled: boolean; onPick(id: string): void }

/** The case's final decision: a choice, a tap on a figure, or a structure. */
export function FinalCall({ lesson, picked, correct, disabled, onPick }: Props) {
  const { lang } = useLang()
  const f = lesson.final
  const state = (id: string) => (id !== picked ? 'idle' : correct ? 'correct' : 'wrong')

  if (f.kind === 'choice') {
    return (
      <div className="options">
        {f.options!.map((o) => (
          <OptionButton key={o.id} state={state(o.id)} disabled={disabled} onClick={() => onPick(o.id)}>{pick(o.text, lang)}</OptionButton>
        ))}
      </div>
    )
  }
  if (f.kind === 'tap2d') {
    const fig = FIGURES[f.figure!]
    return (
      <div className={`figure ${disabled ? 'figure--locked' : ''}`}>
        {fig && <fig.Component picked={picked} onTap={(id) => { if (!disabled) onPick(id) }} />}
      </div>
    )
  }
  return <StructureChoice answer={f.answer} seed={lesson.id} candidates={f.candidates} picked={picked} disabled={disabled} onPick={onPick} />
}
