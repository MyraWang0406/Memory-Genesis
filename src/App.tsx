import { useState, useCallback, useEffect } from 'react'
import { loadLang, saveLang, getCurrentProfileId, getCurrentProfile } from './store'
import type { Dimension } from './types'
import type { Lang } from './i18n'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPromptModal } from './components/LoginPromptModal'
import { AboutView } from './components/AboutView'
import { ProfileView } from './components/ProfileView'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { QuarterView } from './components/QuarterView'
import { YearView } from './components/YearView'
import { LifetimeView } from './components/LifetimeView'
import { LifeKlineChart } from './components/LifeKlineChart'

export default function App() {
  const [dimension, setDimensionState] = useState<Dimension>('about' as Dimension)
  const [date, setDate] = useState(() => new Date())
  const [lang, setLangState] = useState<Lang>(loadLang)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const profileId = getCurrentProfileId()
  const currentProfile = getCurrentProfile()

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    saveLang(l)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const setDimension = useCallback((d: Dimension) => {
    setDimensionState(d)
  }, [])

  const goProfile = () => {
    setShowLoginPrompt(false)
    setDimensionState('profile')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 60 }}>
      <Header
        dimension={dimension}
        onDimensionChange={setDimension}
        lang={lang}
        onLangChange={setLang}
        date={date}
        onDateChange={setDate}
      />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
        {dimension === 'about' && <AboutView lang={lang} />}
        {dimension === 'profile' && (
          <ProfileView lang={lang} onDone={() => setDimensionState('day' as Dimension)} />
        )}
        {dimension === 'day' && (
          <DayView
            date={date}
            lang={lang}
            profileId={profileId}
            currentProfile={currentProfile}
            onNeedProfile={() => setShowLoginPrompt(true)}
          />
        )}
        {dimension === 'week' && (
          <>
            <LifeKlineChart dimension="week" lang={lang} />
            <WeekView date={date} lang={lang} profileId={profileId} />
          </>
        )}
        {dimension === 'month' && (
          <>
            <LifeKlineChart dimension="month" lang={lang} />
            <MonthView date={date} lang={lang} profileId={profileId} />
          </>
        )}
        {dimension === 'quarter' && (
          <>
            <LifeKlineChart dimension="quarter" lang={lang} />
            <QuarterView date={date} lang={lang} profileId={profileId} />
          </>
        )}
        {dimension === 'year' && (
          <>
            <LifeKlineChart dimension="year" lang={lang} />
            <YearView date={date} lang={lang} profileId={profileId} />
          </>
        )}
        {dimension === 'lifetime' && (
          <>
            <LifeKlineChart dimension="lifetime" lang={lang} />
            <LifetimeView date={date} lang={lang} profileId={profileId} />
          </>
        )}
      </main>
      <Footer lang={lang} />
      {showLoginPrompt && (
        <LoginPromptModal
          lang={lang}
          onGoProfile={goProfile}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  )
}
