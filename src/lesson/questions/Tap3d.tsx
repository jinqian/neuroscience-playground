import { RichText } from '../RichText'
import { StructurePicker } from '../../brain/StructurePicker'
import type { QProps } from './types'

/** Find a structure on the 3D brain (a list of names when 3D isn't available). */
export function Tap3d({ question, response, onChange, disabled }: QProps<'tap3d'>) {
  const picked = response && 'structureId' in response ? response.structureId : undefined
  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <StructurePicker answer={question.structure} seed={question.id} picked={picked} disabled={disabled} onPick={(id) => onChange({ structureId: id })} />
    </div>
  )
}
