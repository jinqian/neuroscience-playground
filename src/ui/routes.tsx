import type { ReactNode } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { Dendri } from './Dendri'
import { Header } from './Header'
import { ExplorerScreen } from '../brain/ExplorerScreen'
import { CreditsScreen } from '../credits/CreditsScreen'
import { GlossaryScreen } from '../glossary/GlossaryScreen'
import { LessonScreen } from '../lesson/LessonScreen'
import { NeuronScreen } from '../neuron/NeuronScreen'
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

function Footer() {
  const { lang } = useLang()
  return (
    <footer className="footer">
      <Link to="/credits">{t('credits', lang)}</Link>
      <span>3D brain: BodyParts3D © DBCLS, CC BY-SA 2.1 JP</span>
    </footer>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <Header />
      <main className="main">{children}</main>
      <Footer />
    </div>
  )
}

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell><PathScreen /></Shell>} />
        <Route path="/glossary" element={<Shell><GlossaryScreen /></Shell>} />
        <Route path="/brain" element={<Shell><ExplorerScreen /></Shell>} />
        <Route path="/neuron" element={<Shell><NeuronScreen /></Shell>} />
        <Route path="/credits" element={<Shell><CreditsScreen /></Shell>} />
        <Route path="/lesson/:lessonId" element={<LessonScreen />} />
        <Route path="*" element={<Shell><Placeholder /></Shell>} />
      </Routes>
    </HashRouter>
  )
}
