import { useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { XP } from '../engine/xp'
import { ALL_LANGUAGES } from '../config'
import { LANG_LABEL, pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { useProgress } from '../progress/store'
import { Button } from '../ui/Button'
import { BrainView, NoWebGL } from './BrainView'
import { StructureList } from './StructureList'
import type { Hemisphere } from './visual'

export function ExplorerScreen() {
  const { structures, units } = useContent()
  const { lang } = useLang()
  const discovered = useProgress((s) => s.discovered)
  const recordStructureQuiz = useProgress((s) => s.recordStructureQuiz)
  const [selected, setSelected] = useState<string>()
  const [translucent, setTranslucent] = useState(false)
  const [hemisphere, setHemisphere] = useState<Hemisphere>('both')
  const [onlyUnit, setOnlyUnit] = useState<string>('all')
  const [resetKey, setResetKey] = useState(0)
  const [quiz, setQuiz] = useState<{ target: string; result?: 'found' | string } | null>(null)

  const s = structures.find((x) => x.id === selected)
  const isDiscovered = !!s && discovered.includes(s.id)
  const only = onlyUnit === 'all' ? undefined : structures.filter((x) => x.units.includes(onlyUnit)).map((x) => x.id)
  const unitsWithParts = units.filter((u) => structures.some((x) => x.units.includes(u.id) && !x.twoDOnly))
  const twoD = structures.filter((x) => x.twoDOnly)

  const onPick = (id: string) => {
    if (quiz && !quiz.result) {
      const correct = id === quiz.target
      recordStructureQuiz(quiz.target, correct, new Date())
      setQuiz({ ...quiz, result: correct ? 'found' : id })
      return
    }
    setSelected(id)
  }

  const nameOf = (id: string) => pick(structures.find((x) => x.id === id)!.name, lang)
  const otherNames = s ? ALL_LANGUAGES.filter((l) => l !== lang && s.name[l]) : []

  return (
    <div className="explorer">
      <div className="explorer__head">
        <h1>{t('brainTitle', lang)}</h1>
        <p className="muted-strong">{t('brainIntro', lang)}</p>
      </div>

      <div className="explorer__tools">
        <label className="toggle">
          <input id="see-through" type="checkbox" checked={translucent} onChange={(e) => setTranslucent(e.target.checked)} />
          {t('seeThrough', lang)}
        </label>
        <div className="seg seg--light" role="group" aria-label={t('hemisphere', lang)}>
          {(['both', 'left', 'right'] as const).map((h) => (
            <button key={h} type="button" aria-pressed={hemisphere === h} onClick={() => setHemisphere(h)}>{t(h, lang)}</button>
          ))}
        </div>
        <select id="only-unit" className="select" value={onlyUnit} onChange={(e) => setOnlyUnit(e.target.value)} aria-label={t('allUnits3d', lang)}>
          <option value="all">{t('allUnits3d', lang)}</option>
          {unitsWithParts.map((u) => <option key={u.id} value={u.id}>{t('onlyUnit', lang, { n: u.number })}</option>)}
        </select>
        <Button variant="ghost" onClick={() => setResetKey((k) => k + 1)}>{t('resetView', lang)}</Button>
      </div>

      <div className="explorer__main">
        <div className="explorer__stage">
          {quiz && (
            <div className={`quiz-banner ${quiz.result === 'found' ? 'quiz-banner--ok' : quiz.result ? 'quiz-banner--wrong' : ''}`} role="status">
              <span>
                {!quiz.result && t('findPrompt', lang, { name: nameOf(quiz.target) })}
                {quiz.result === 'found' && t('foundIt', lang, { n: XP.correct })}
                {quiz.result && quiz.result !== 'found' && t('notThat', lang, { name: nameOf(quiz.result) })}
              </span>
              {quiz.result && quiz.result !== 'found' && <Button variant="secondary" onClick={() => setQuiz({ target: quiz.target })}>{t('tryAgain', lang)}</Button>}
              <Button variant="ghost" onClick={() => setQuiz(null)}>{t('close', lang)}</Button>
            </div>
          )}
          <BrainView
            labels={!quiz}
            translucentCortex={translucent}
            hemisphere={hemisphere}
            only={only}
            highlight={selected && !quiz ? [selected] : []}
            resetKey={resetKey}
            onPick={onPick}
            fallback={<><NoWebGL /><StructureList selected={selected} onPick={onPick} /></>}
          />
          <p className="explorer__help">{t('brainHelp', lang)}</p>
        </div>

        <section className="panel" aria-label={t('structureDetails', lang)}>
          {!s && <p className="muted-strong">{t('pickAPart', lang)}</p>}
          {s && !isDiscovered && (
            <>
              <h2>{t('notDiscovered', lang)}</h2>
              <p className="muted-strong">{t('notDiscoveredHelp', lang)}</p>
            </>
          )}
          {s && isDiscovered && (
            <>
              <h2>{pick(s.name, lang)}</h2>
              <p className="panel__langs">
                {otherNames.length ? otherNames.map((l) => `${LANG_LABEL[l]}: ${s.name[l]}`).join(' · ') : t('otherLangsSoon', lang)}
              </p>
              <p>{pick(s.note, lang)}</p>
              {s.units[0] && <p className="panel__unit">{t('taughtIn', lang, { n: units.find((u) => u.id === s.units[0])?.number ?? '?' })}</p>}
              <Button onClick={() => { setQuiz({ target: s.id }); setSelected(undefined) }}>{t('quizMe', lang)}</Button>
            </>
          )}
        </section>
      </div>

      {twoD.length > 0 && (
        <div className="explorer__twod">
          <span className="chip chip--static">{t('twoDOnly', lang)}</span>
          <span className="muted-strong">{t('twoDOnlyHelp', lang)}</span>
          {twoD.map((x) => <span key={x.id} className="twod-name">{pick(x.name, lang)}</span>)}
        </div>
      )}
    </div>
  )
}
