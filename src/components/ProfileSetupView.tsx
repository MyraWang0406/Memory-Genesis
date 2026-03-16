import { useState, useMemo } from 'react'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import type { Profile, CalibrationEvent } from '../types'
import { loadProfiles, saveProfiles, setCurrentProfileId } from '../store'
import { genId } from '../utils/id'
import { syncProfile } from '../services/evermemos'
import {
  parseBirthPlace,
  joinBirthPlace,
  COUNTRIES_ZH,
  COUNTRIES_EN,
  PROVINCES_ZH,
  CITIES_BY_PROVINCE_ZH,
  CITIES_BY_COUNTRY_ZH,
  CITIES_BY_COUNTRY_EN,
} from '../data/regions'

interface Props {
  lang: Lang
  onDone: () => void
  initialProfileId?: string | null
}

export function ProfileSetupView({ lang, onDone, initialProfileId }: Props) {
  const T = getText(lang)
  const existing = loadProfiles()
  const editing = initialProfileId ? existing.find((p) => p.id === initialProfileId) : null
  const parsed = useMemo(() => parseBirthPlace(editing?.birthPlace), [editing?.birthPlace])
  const [name, setName] = useState(editing?.name ?? '')
  const [birthDate, setBirthDate] = useState(editing?.birthDate ?? '')
  const [birthTime, setBirthTime] = useState(editing?.birthTime ?? '')
  const [country, setCountry] = useState(parsed.country || '')
  const [province, setProvince] = useState(parsed.province || '')
  const optionsForCity = useMemo(() => {
    if (parsed.country === '中国' && parsed.province) return CITIES_BY_PROVINCE_ZH[parsed.province] ?? []
    if (parsed.country) return CITIES_BY_COUNTRY_ZH[parsed.country] ?? []
    return []
  }, [parsed.country, parsed.province])
  const isCityInList = parsed.city && optionsForCity.includes(parsed.city)
  const [city, setCity] = useState(isCityInList ? parsed.city : (parsed.city ? '其他' : ''))
  const [cityOtherText, setCityOtherText] = useState(parsed.city && !isCityInList ? parsed.city : '')
  const [events, setEvents] = useState<CalibrationEvent[]>(editing?.calibrationEvents ?? [])
  const [timeYear, setTimeYear] = useState('')
  const [timeMonth, setTimeMonth] = useState('')
  const [timeDay, setTimeDay] = useState('')
  const [eventDesc, setEventDesc] = useState('')
  const [eventKind, setEventKind] = useState<'吉' | '凶'>('吉')

  const addEvent = () => {
    const y = timeYear.trim() || new Date().getFullYear().toString()
    let key = y
    if (timeMonth.trim()) key = `${y}-${timeMonth.padStart(2, '0')}`
    if (timeDay.trim()) key = `${key}-${timeDay.padStart(2, '0')}`
    if (!eventDesc.trim()) return
    setEvents((prev) => [
      ...prev,
      { id: genId(), timeKey: key, desc: eventDesc.trim(), kind: eventKind },
    ])
    setEventDesc('')
    setTimeYear('')
    setTimeMonth('')
    setTimeDay('')
  }

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const cityValue = city === '其他' ? (cityOtherText.trim() || '其他') : city
  const birthPlaceStr = joinBirthPlace(country, province, cityValue)

  const save = () => {
    const profile: Profile = {
      id: editing?.id ?? genId(),
      name: name.trim() || undefined,
      birthDate: birthDate || new Date().toISOString().slice(0, 10),
      birthTime: birthTime.trim() || undefined,
      birthPlace: birthPlaceStr || undefined,
      calibrationEvents: events,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    }
    const list = editing ? existing.map((p) => (p.id === profile.id ? profile : p)) : [...existing, profile]
    saveProfiles(list)
    setCurrentProfileId(profile.id)
    syncProfile(profile.id, {
      name: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      birthPlace: birthPlaceStr || profile.birthPlace,
      calibrationEvents: profile.calibrationEvents,
    }).catch(() => {})
    onDone()
  }

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => { setAuthMode('login'); setAuthModalOpen(true) }}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
        >
          {T.login}
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('register'); setAuthModalOpen(true) }}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', cursor: 'pointer' }}
        >
          {T.register}
        </button>
      </div>
      {authModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setAuthModalOpen(false)}
        >
          <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '1.5rem', maxWidth: 360, width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>{authMode === 'login' ? T.login : T.register}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button type="button" onClick={() => setAuthModalOpen(false)} style={{ padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>{T.loginWithEmail}</button>
              <button type="button" onClick={() => setAuthModalOpen(false)} style={{ padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>{T.loginWithGmail}</button>
            </div>
            <button type="button" onClick={() => setAuthModalOpen(false)} style={{ marginTop: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>{lang === 'zh' ? '关闭' : 'Close'}</button>
          </div>
        </div>
      )}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>{T.profileCreate}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.profileName}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'zh' ? '可选' : 'Optional'}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginTop: '0.25rem',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.profileBirthDate}</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0.25rem 0' }}>{T.profileBirthDateHint}</p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              lang={lang}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginTop: '0.25rem',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.profileBirthTime}</label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginTop: '0.25rem',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.profileBirthPlace}</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0.25rem 0' }}>{T.profileBirthPlaceHint}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setProvince(''); setCity('') }}
                style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 120 }}
              >
                <option value="">{lang === 'zh' ? '请选国家' : 'Country'}</option>
                {COUNTRIES_ZH.map((c, i) => (
                  <option key={c} value={c}>{lang === 'zh' ? c : COUNTRIES_EN[i]}</option>
                ))}
              </select>
              {country === '中国' && (
                <select
                  value={province}
                  onChange={(e) => { setProvince(e.target.value); setCity('') }}
                  style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 140 }}
                >
                  <option value="">{lang === 'zh' ? '请选省' : 'Province'}</option>
                  {PROVINCES_ZH.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); if (e.target.value !== '其他') setCityOtherText('') }}
                style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 120 }}
              >
                <option value="">{lang === 'zh' ? '请选市' : 'City'}</option>
                {country === '中国' && province
                  ? (CITIES_BY_PROVINCE_ZH[province] ?? []).map((c) => <option key={c} value={c}>{c}</option>)
                  : country
                    ? (() => {
                        const citiesZh = CITIES_BY_COUNTRY_ZH[country] ?? []
                        const enKey = COUNTRIES_EN[COUNTRIES_ZH.indexOf(country as typeof COUNTRIES_ZH[number])]
                        const citiesEn = (enKey && CITIES_BY_COUNTRY_EN[enKey]) ?? []
                        return citiesZh.map((c, i) => (
                          <option key={c} value={c}>{lang === 'zh' ? c : (citiesEn[i] ?? c)}</option>
                        ))
                      })()
                    : null}
              </select>
              {city === '其他' && (
                <input
                  type="text"
                  value={cityOtherText}
                  onChange={(e) => setCityOtherText(e.target.value)}
                  placeholder={lang === 'zh' ? '请填写具体城市' : 'Enter city name'}
                  style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 140 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(249, 115, 22, 0.08)',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(249, 115, 22, 0.25)',
        }}
      >
        <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem' }}>{T.calibrationTitle}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>{T.calibrationDesc}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>{T.calibrationExample}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={timeYear}
            onChange={(e) => setTimeYear(e.target.value)}
            placeholder={T.calibrationTimeYear}
            style={{ width: 56, padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <input
            type="text"
            value={timeMonth}
            onChange={(e) => setTimeMonth(e.target.value)}
            placeholder={T.calibrationTimeMonth}
            style={{ width: 44, padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <input
            type="text"
            value={timeDay}
            onChange={(e) => setTimeDay(e.target.value)}
            placeholder={T.calibrationTimeDay}
            style={{ width: 44, padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <input
            type="text"
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            placeholder={T.calibrationPlaceholder}
            style={{ flex: 1, minWidth: 140, padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <button
            type="button"
            onClick={() => setEventKind(eventKind === '吉' ? '凶' : '吉')}
            style={{
              padding: '0.4rem 0.6rem',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: eventKind === '吉' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
              color: eventKind === '吉' ? 'var(--k-up)' : 'var(--k-down)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {eventKind === '吉' ? T.calibrationGood : T.calibrationJi}
          </button>
          <button
            type="button"
            onClick={addEvent}
            style={{
              padding: '0.4rem 0.75rem',
              border: 'none',
              borderRadius: 6,
              background: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            + {T.calibrationAdd}
          </button>
        </div>
        {events.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              background: 'rgba(0,0,0,0.03)',
              borderRadius: 8,
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            {T.noCalibration}
          </div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
            {events.map((e) => (
              <li key={e.id} style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: e.kind === '吉' ? 'var(--k-up)' : 'var(--k-down)' }}>•</span>
                {e.timeKey}: {e.desc} ({e.kind})
                <button type="button" onClick={() => removeEvent(e.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onDone}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {T.rechoose}
        </button>
        <button
          type="button"
          onClick={save}
          style={{
            padding: '0.5rem 1.25rem',
            border: 'none',
            borderRadius: 8,
            background: 'var(--primary-dark)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {T.confirmStart}
        </button>
      </div>
    </div>
  )
}
