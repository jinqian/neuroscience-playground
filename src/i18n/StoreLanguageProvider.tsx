import type { ReactNode } from 'react'
import { useProgress } from '../progress/store'
import { LanguageProvider } from './LanguageProvider'

/** The app's language provider: the chosen language lives in (and is saved with) the progress store. */
export function StoreLanguageProvider({ children }: { children: ReactNode }) {
  const lang = useProgress((s) => s.lang)
  const setLang = useProgress((s) => s.setLang)
  return (
    <LanguageProvider lang={lang} onLangChange={setLang}>
      {children}
    </LanguageProvider>
  )
}
