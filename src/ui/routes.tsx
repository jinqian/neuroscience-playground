import type { ReactNode } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { Dendri } from './Dendri'
import { Header } from './Header'
import { LessonScreen } from '../lesson/LessonScreen'
import { PathScreen } from './PathScreen'

function Placeholder() {
  const { lang } = useLang()
  return (
    <div className="notice">
      <Dendri />
      <p>{t('notBuiltYet', lang)}</p>
      <Link className="btn btn--secondary" to="/">{t('backToPath', lang)}</Link>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <Header />
      <main className="main">{children}</main>
    </div>
  )
}

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell><PathScreen /></Shell>} />
        <Route path="/glossary" element={<Shell><Placeholder /></Shell>} />
        <Route path="/brain" element={<Shell><Placeholder /></Shell>} />
        <Route path="/lesson/:lessonId" element={<LessonScreen />} />
        <Route path="*" element={<Shell><Placeholder /></Shell>} />
      </Routes>
    </HashRouter>
  )
}
