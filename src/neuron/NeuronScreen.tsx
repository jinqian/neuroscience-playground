import { lazy, Suspense, useState } from 'react'
import { hasWebGL } from '../brain/webgl'
import { useContent } from '../content/ContentProvider'
import { pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { Button } from '../ui/Button'
import { MYELIN_PARTS } from './parts'
import { signalOptions } from './shape'
import { signalDuration, type Phase } from './signal'

const NeuronCanvas = lazy(() => import('./NeuronCanvas'))

/** How many times slower the signal is without myelin, for the "compare" message. */
const SLOWDOWN = Math.round(signalDuration(signalOptions(false)) / signalDuration(signalOptions(true)))

export function NeuronScreen() {
  const { neuron, glossary } = useContent()
  const { lang } = useLang()
  const [can] = useState(hasWebGL)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<string>()
  const [myelin, setMyelin] = useState(true)
  const [labels, setLabels] = useState(true)
  const [speed, setSpeed] = useState<'slow' | 'fast'>('slow')
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const threeD = can && !failed
  const parts = neuron.filter((p) => myelin || !MYELIN_PARTS.includes(p.id))
  const part = parts.find((p) => p.id === selected)
  const term = part && glossary.find((g) => g.id === part.term)
  const wiki = term && (term.wiki[lang] ?? term.wiki.en)
  const playing = phase !== null && phase !== 'done'

  const toggleMyelin = (on: boolean) => {
    setMyelin(on)
    setPhase(null)
    if (!on && selected && MYELIN_PARTS.includes(selected)) setSelected(undefined)
  }

  const status =
    phase === 'dendrite' ? t('phaseDendrite', lang)
    : phase === 'soma' ? t('phaseSoma', lang)
    : phase === 'axon' ? t(myelin ? 'phaseAxonMyelin' : 'phaseAxonBare', lang)
    : phase === 'terminal' ? t('phaseTerminal', lang)
    : phase === 'done' ? (myelin ? t('doneMyelin', lang) : t('doneBare', lang, { n: SLOWDOWN }))
    : null

  return (
    <div className="explorer">
      <div className="explorer__head">
        <h1>{t('neuronTitle', lang)}</h1>
        <p className="muted-strong">{t('neuronIntro', lang)}</p>
      </div>

      <div className="explorer__tools">
        {threeD && (
          <Button
            onClick={() => {
              setRun((r) => r + 1)
              setPhase('dendrite')
            }}
            disabled={playing}
          >
            ⚡ {t('sendSignal', lang)}
          </Button>
        )}
        <label className="toggle">
          <input type="checkbox" checked={!myelin} onChange={(e) => toggleMyelin(!e.target.checked)} />
          {t('removeMyelin', lang)}
        </label>
        {threeD && (
          <>
            <label className="toggle">
              <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
              {t('showLabels', lang)}
            </label>
            <div className="seg seg--light" role="group" aria-label={t('speed', lang)}>
              {(['slow', 'fast'] as const).map((s) => (
                <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{t(s, lang)}</button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setResetKey((k) => k + 1)}>{t('resetView', lang)}</Button>
          </>
        )}
      </div>

      <div className="explorer__main">
        <div className="explorer__stage">
          {threeD ? (
            <>
              <div className="brain-stage neuron-stage">
                <Suspense fallback={<p className="brain-loading">{t('loadingNeuron', lang)}</p>}>
                  <NeuronCanvas
                    parts={parts}
                    lang={lang}
                    selected={selected}
                    myelin={myelin}
                    labels={labels}
                    run={phase === null ? 0 : run}
                    speed={speed === 'slow' ? 0.4 : 1}
                    resetKey={resetKey}
                    onPick={setSelected}
                    onPhase={setPhase}
                    onError={() => setFailed(true)}
                  />
                </Suspense>
              </div>
              <p className="signal-status" role="status">{status}</p>
              <p className="explorer__help">{t('neuronHelp', lang)}</p>
            </>
          ) : (
            <>
              <p className="brain-nowebgl">{t('noWebglNeuron', lang)}</p>
              <ul className="structure-list" aria-label={t('neuronParts', lang)}>
                {parts.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="chip" aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}>
                      {pick(p.name, lang)}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <section className="panel" aria-label={t('partDetails', lang)}>
          {!part && <p className="muted-strong">{t('pickANeuronPart', lang)}</p>}
          {part && (
            <>
              <h2>{pick(part.name, lang)}</h2>
              <p>{pick(part.note, lang)}</p>
              {wiki && <a className="panel__wiki" href={wiki} target="_blank" rel="noreferrer">{t('readOnWikipedia', lang)} ↗</a>}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

