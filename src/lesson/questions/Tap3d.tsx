import { RichText } from '../RichText'
import { StructureChoice } from './StructureChoice'
import type { QProps } from './types'

/** Find a structure. Until the 3D viewer exists this is a list of names (Task 13 adds the 3D version). */
export function Tap3d({ question, response, onChange, disabled }: QProps<'tap3d'>) {
  const picked = response && 'structureId' in response ? response.structureId : undefined
  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <StructureChoice answer={question.structure} seed={question.id} picked={picked} disabled={disabled} onPick={(id) => onChange({ structureId: id })} />
    </div>
  )
}
