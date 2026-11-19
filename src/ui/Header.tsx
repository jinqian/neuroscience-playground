import { Link, NavLink } from 'react-router-dom'
import { LanguageSwitcher } from '../i18n/LanguageSwitcher'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { localDay } from '../progress/dates'
import { useProgress } from '../progress/store'
import { displayStreak } from '../progress/streak'
import { Dendri } from './Dendri'
import { BoltIcon, BrainIcon, FlameIcon } from './icons'

export function Header() {
  const { lang } = useLang()
  const streak = useProgress((s) => s.streak)
  const xp = useProgress((s) => s.xp)
  const days = displayStreak(streak, localDay(new Date()))
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">
          <Dendri size={34} />
          {t('appName', lang)}
        </Link>
        <span className="header__spacer" />
        <span className="stat stat--streak" title={t('streakLabel', lang, { n: days })}>
          <FlameIcon /> {days}
        </span>
        <span className="stat stat--xp" title={t('xpLabel', lang, { n: xp })}>
          <BoltIcon /> {xp}
        </span>
        <NavLink to="/glossary" className="nav-link">{t('glossary', lang)}</NavLink>
        <NavLink to="/brain" className="nav-link"><BrainIcon /> {t('brain', lang)}</NavLink>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
