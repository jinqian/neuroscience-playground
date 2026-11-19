import { useContent } from '../content/ContentProvider'
import { pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'

/** A plain list of 3D-capable structures, used when 3D can't run. */
export function StructureList({ selected, onPick }: { selected?: string; onPick(id: string): void }) {
  const { lang } = useLang()
  const structures = useContent().structures.filter((s) => !s.twoDOnly)
  return (
    <ul className="structure-list">
      {structures.map((s) => (
        <li key={s.id}>
          <button type="button" className="chip" aria-pressed={selected === s.id} onClick={() => onPick(s.id)}>
            {pick(s.name, lang)}
          </button>
        </li>
      ))}
    </ul>
  )
}
