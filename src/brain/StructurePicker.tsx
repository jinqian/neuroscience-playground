import { useContent } from '../content/ContentProvider'
import { pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { StructureChoice } from '../lesson/questions/StructureChoice'
import { BrainView } from './BrainView'

type Props = { answer: string; seed: string; picked?: string; onPick(id: string): void; disabled: boolean; candidates?: string[] }

/** Pick a structure on the 3D brain; falls back to a list of names when 3D can't be used. */
export function StructurePicker(props: Props) {
  const { lang } = useLang()
  const structures = useContent().structures
  const target = structures.find((s) => s.id === props.answer)
  const list = <StructureChoice {...props} />
  if (!target || target.twoDOnly) return list
  const pickedName = props.picked ? structures.find((s) => s.id === props.picked)?.name : undefined
  return (
    <div className="picker">
      <BrainView
        labels={false}
        translucentCortex={false}
        hemisphere="both"
        only={props.candidates}
        highlight={props.picked ? [props.picked] : []}
        onPick={(id) => { if (!props.disabled) props.onPick(id) }}
        fallback={list}
      />
      {pickedName && <p className="picker__picked">{t('youPicked', lang, { name: pick(pickedName, lang) })}</p>}
    </div>
  )
}
