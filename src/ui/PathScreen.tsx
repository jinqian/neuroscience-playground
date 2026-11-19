import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../content/ContentProvider'
import type { Lesson } from '../content/schema'
import { pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { nodeStates } from '../progress/access'
import { useProgress } from '../progress/store'
import { CheckIcon, FlaskIcon, MagnifierIcon } from './icons'

/** Horizontal offsets that make the path wind, repeated down each unit. */
const OFFSETS = [0, -26, -34, -10, 22, 30]

function NodeIcon({ lesson, number, done }: { lesson: Lesson; number: number; done: boolean }) {
  if (done) return <CheckIcon />
  if (lesson.type === 'lab') return <FlaskIcon />
  if (lesson.type === 'case') return <MagnifierIcon />
  return <>{number}</>
}

export function PathScreen() {
  const bundle = useContent()
  const { lang } = useLang()
  const completedMap = useProgress((s) => s.completed)
  const badges = useProgress((s) => s.badges)
  const completed = new Set(Object.keys(completedMap))

  return (
    <div className="path">
      {bundle.units.map((unit) => {
        const states = nodeStates(unit, bundle.lessons, completed)
        let biteNumber = 0
        return (
          <section key={unit.id} className="unit" style={{ '--unit-color': unit.color } as CSSProperties}>
            <div className="unit__banner">
              <div>
                <div className="unit__label">{t('unitLabel', lang, { n: unit.number, name: pick(unit.nickname, lang) })}</div>
                <div className="unit__module">{pick(unit.title, lang)}</div>
              </div>
              {badges.includes(unit.id) && (
                <svg className="unit__badge" viewBox="0 0 36 36" aria-label="Unit badge earned">
                  <circle cx="18" cy="18" r="16" fill="#ffc93c" stroke="#fff" strokeWidth="3" />
                  <path d="M18 9l2.6 5.6 6 .7-4.5 4.1 1.2 6L18 22.4l-5.3 3 1.2-6-4.5-4.1 6-.7z" fill="#fff" />
                </svg>
              )}
            </div>
            {unit.lessons.length === 0 ? (
              <p className="unit__soon">{t('comingSoon', lang)}</p>
            ) : (
              <div className="unit__nodes">
                {unit.lessons.map((id, i) => {
                  const lesson = bundle.lessons[id]
                  if (lesson.type === 'bite') biteNumber += 1
                  const state = states[id]
                  const title = pick(lesson.title, lang)
                  const kind = t(lesson.type === 'bite' ? 'lessonBite' : lesson.type === 'lab' ? 'lessonLab' : 'lessonCase', lang)
                  const style = { transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }
                  const icon = <NodeIcon lesson={lesson} number={biteNumber} done={state === 'done'} />
                  return (
                    <div key={id} className="node-wrap" style={style}>
                      {state === 'locked' ? (
                        <button type="button" className="node" data-state={state} aria-disabled="true" aria-label={`${kind}: ${title} (${t('locked', lang)})`}>
                          {icon}
                        </button>
                      ) : (
                        <Link to={`/lesson/${id}`} className="node" data-state={state} aria-label={`${kind}: ${title}`}>
                          {icon}
                        </Link>
                      )}
                      <span className="node__title" aria-hidden="true">{title}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
