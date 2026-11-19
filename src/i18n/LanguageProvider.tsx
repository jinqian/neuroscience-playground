import { createContext, useContext, useState, type ReactNode } from 'react'
import { ENABLED_LANGUAGES } from '../config'
import type { Lang } from './lang'

type LangContextValue = { lang: Lang; setLang(l: Lang): void; enabled: Lang[] }

const LangContext = createContext<LangContextValue | null>(null)

type Props = {
  children: ReactNode
  enabled?: Lang[]
  initialLang?: Lang
  /** Controlled mode: the current language comes from outside (the progress store). */
  lang?: Lang
  onLangChange?(l: Lang): void
}

export function LanguageProvider({ children, enabled = ENABLED_LANGUAGES, initialLang, lang, onLangChange }: Props) {
  const [own, setOwn] = useState<Lang>(initialLang ?? enabled[0] ?? 'en')
  const current = lang ?? own
  const value: LangContextValue = {
    lang: enabled.includes(current) ? current : (enabled[0] ?? 'en'),
    enabled,
    setLang(l) {
      if (!enabled.includes(l)) return
      setOwn(l)
      onLangChange?.(l)
    },
  }
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}
