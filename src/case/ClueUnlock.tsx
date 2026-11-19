import { useState } from 'react'
import type { Question } from '../content/schema'
import { isCorrect, type Response } from '../engine/check'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { QuestionView } from '../lesson/questions/QuestionView'
import { isComplete } from '../lesson/questions/types'
import { RichText } from '../lesson/RichText'
import { Button } from '../ui/Button'

/** The question that unlocks a clue, shown inline in the case file. */
export function ClueUnlock({ question, onAnswer }: { question: Question; onAnswer(correct: boolean): void }) {
  const { lang } = useLang()
  const [response, setResponse] = useState<Response>()
  const [wrong, setWrong] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const check = () => {
    if (!response) return
    const ok = isCorrect(question, response)
    onAnswer(ok)
    if (!ok) setWrong(true)
  }

  return (
    <div className="unlock">
      <QuestionView key={attempt} question={question} response={response} onChange={setResponse} disabled={wrong} result={wrong ? 'wrong' : undefined} />
      {wrong ? (
        <div className="unlock__wrong" role="status">
          <p><b>{t('wrongTitle', lang)}.</b> <RichText text={question.explain ?? { en: '' }} /></p>
          <Button variant="secondary" onClick={() => { setWrong(false); setResponse(undefined); setAttempt((a) => a + 1) }}>{t('tryAgain', lang)}</Button>
        </div>
      ) : (
        <Button onClick={check} disabled={!isComplete(question, response)}>{t('check', lang)}</Button>
      )}
    </div>
  )
}
