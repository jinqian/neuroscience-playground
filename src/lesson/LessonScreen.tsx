import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useContent } from '../content/ContentProvider'
import type { Bite, Lesson } from '../content/schema'
import { bitePlan } from '../engine/lessonRun'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { LabScreen } from '../lab/LabScreen'
import { useProgress } from '../progress/store'
import { Dendri } from '../ui/Dendri'
import { CompleteScreen } from './CompleteScreen'
import { RunPlayer } from './RunPlayer'

function BitePlayer({ lesson }: { lesson: Bite }) {
  const completeLesson = useProgress((s) => s.completeLesson)
  const [earned, setEarned] = useState<number | null>(null)
  if (earned !== null) return <CompleteScreen xp={earned} />
  return (
    <RunPlayer
      steps={bitePlan(lesson)}
      cards={lesson.cards}
      questions={lesson.questions}
      onDone={(run) => {
        completeLesson(lesson, run.missed, new Date())
        setEarned(run.xp)
      }}
    />
  )
}

function Player({ lesson }: { lesson: Lesson }) {
  if (lesson.type === 'bite') return <BitePlayer lesson={lesson} />
  if (lesson.type === 'lab') return <LabScreen lesson={lesson} />
  return null
}

export function LessonScreen() {
  const { lessonId = '' } = useParams()
  const { lang } = useLang()
  const lesson = useContent().lessons[lessonId]
  if (!lesson) {
    return (
      <div className="notice">
        <Dendri mood="oops" />
        <p>{t('lessonNotFound', lang)}</p>
        <Link className="btn btn--secondary" to="/">{t('backToPath', lang)}</Link>
      </div>
    )
  }
  return <Player key={lesson.id} lesson={lesson} />
}
