import { Fragment, useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { parseRich } from '../content/richText'
import { pick, type LText } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { TermPopover } from './TermPopover'

function Term({ termId, label }: { termId: string; label?: string }) {
  const { lang } = useLang()
  const term = useContent().glossary.find((g) => g.id === termId)
  const [open, setOpen] = useState(false)
  const shown = label ?? term?.[lang] ?? term?.en ?? termId
  return (
    <span className="term-wrap">
      <button type="button" className="term" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {shown}
      </button>
      {open && <TermPopover termId={termId} onClose={() => setOpen(false)} />}
    </span>
  )
}

/** Renders lesson text with **bold** and [[term]] markup in the current language. */
export function RichText({ text }: { text: LText }) {
  const { lang } = useLang()
  return (
    <>
      {parseRich(pick(text, lang)).map((seg, i) => (
        <Fragment key={i}>
          {seg.kind === 'text' && seg.text}
          {seg.kind === 'bold' && <strong>{seg.text}</strong>}
          {seg.kind === 'term' && <Term termId={seg.termId} label={seg.label} />}
        </Fragment>
      ))}
    </>
  )
}
