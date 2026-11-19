import type { Question } from '../../content/schema'
import type { Response } from '../../engine/check'
import { VerifyBadge } from '../VerifyBadge'
import { Gap } from './Gap'
import { Match } from './Match'
import { Mc } from './Mc'
import { Order } from './Order'
import { Tap2d } from './Tap2d'
import { Tap3d } from './Tap3d'
import { TermMatch } from './TermMatch'
import { TfWhy } from './TfWhy'

type Props = { question: Question; response: Response | undefined; onChange(r: Response): void; disabled: boolean; result?: 'correct' | 'wrong' }

export function QuestionView(props: Props) {
  const { question: q } = props
  const common = { response: props.response, onChange: props.onChange, disabled: props.disabled, result: props.result }
  return (
    <>
      {q.verify && <VerifyBadge />}
      {q.kind === 'mc' && <Mc question={q} {...common} />}
      {q.kind === 'gap' && <Gap question={q} {...common} />}
      {q.kind === 'order' && <Order question={q} {...common} />}
      {q.kind === 'match' && <Match question={q} {...common} />}
      {q.kind === 'tfwhy' && <TfWhy question={q} {...common} />}
      {q.kind === 'tap2d' && <Tap2d question={q} {...common} />}
      {q.kind === 'tap3d' && <Tap3d question={q} {...common} />}
      {q.kind === 'termmatch' && <TermMatch question={q} {...common} />}
    </>
  )
}
