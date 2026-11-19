import { lazy, Suspense, useState, type ReactNode } from 'react'
import { useContent } from '../content/ContentProvider'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { useProgress } from '../progress/store'
import type { BrainCanvasProps } from './BrainCanvas'
import { hasWebGL } from './webgl'

const BrainCanvas = lazy(() => import('./BrainCanvas'))

type Props = Omit<BrainCanvasProps, 'structures' | 'units' | 'lang' | 'discovered' | 'onError'> & {
  /** What to show when 3D can't run. */
  fallback: ReactNode
}

/** The 3D brain, or `fallback` when WebGL is missing or the model fails to load. */
export function BrainView({ fallback, ...rest }: Props) {
  const { structures, units } = useContent()
  const { lang } = useLang()
  const discovered = useProgress((s) => s.discovered)
  const [failed, setFailed] = useState(false)
  const [can] = useState(hasWebGL)
  if (!can || failed) return <>{fallback}</>
  return (
    <div className="brain-stage">
      <Suspense fallback={<p className="brain-loading">{t('loading3d', lang)}</p>}>
        <BrainCanvas {...rest} structures={structures} units={units} lang={lang} discovered={discovered} onError={() => setFailed(true)} />
      </Suspense>
    </div>
  )
}

/** Shared "no 3D" message. */
export function NoWebGL() {
  const { lang } = useLang()
  return <p className="brain-nowebgl">{t('noWebgl', lang)}</p>
}
