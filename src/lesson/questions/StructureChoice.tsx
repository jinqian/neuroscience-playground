import { useContent } from '../../content/ContentProvider'
import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { OptionButton } from '../../ui/Button'
import { seededShuffle } from './shuffle'

/** A multiple-choice list of structure names: the answer plus three others. Used when 3D isn't available. */
export function StructureChoice({ answer, seed, picked, onPick, disabled, candidates }: {
  answer: string; seed: string; picked?: string; onPick(id: string): void; disabled: boolean; candidates?: string[]
}) {
  const { lang } = useLang()
  const structures = useContent().structures
  const pool = candidates ?? seededShuffle(structures.map((s) => s.id).filter((id) => id !== answer), seed).slice(0, 3).concat(answer)
  const ids = seededShuffle(pool, seed + ':order')
  return (
    <div className="options">
      {ids.map((id) => {
        const s = structures.find((x) => x.id === id)
        return (
          <OptionButton key={id} state={picked === id ? 'selected' : 'idle'} disabled={disabled} onClick={() => onPick(id)}>
            {s ? pick(s.name, lang) : id}
          </OptionButton>
        )
      })}
    </div>
  )
}
