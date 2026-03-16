import { useState, useRef, useEffect } from 'react'
import type { FortuneItem } from '../types'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import type { ConstellationMode } from '../store'

interface Props {
  fortune: FortuneItem
  lang: Lang
  constellationMode: ConstellationMode
  onConstellationModeChange: (mode: ConstellationMode) => void
  hasProfile: boolean
  /** 档案出生日期，用于按档案人员星座；无则提示先填写 */
  profileBirthDate?: string
}

export function EmotionCalendar({ fortune, lang, constellationMode, onConstellationModeChange, hasProfile, profileBirthDate }: Props) {
  const T = getText(lang)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showModeMenu) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowModeMenu(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [showModeMenu])

  return (
    <section
      className="emotion-calendar"
      style={{
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--primary)',
            fontWeight: 600,
          }}
        >
          {fortune.constellation}
        </span>
        {constellationMode === 'profile' && hasProfile && !profileBirthDate && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            （{lang === 'zh' ? '请先在档案中填写出生日期' : 'Set birth date in profile'}）
          </span>
        )}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowModeMenu((v) => !v)}
            title={T.edit}
            style={{
              padding: '0.2rem',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✎
          </button>
          {showModeMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                background: 'var(--card-bg)',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                minWidth: 160,
                padding: '0.35rem 0',
              }}
            >
              {hasProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onConstellationModeChange('profile')
                    setShowModeMenu(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    background: constellationMode === 'profile' ? 'rgba(74,144,226,0.12)' : 'transparent',
                    color: constellationMode === 'profile' ? 'var(--primary-dark)' : 'var(--text)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                  }}
                >
                  {T.constellationByProfile}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onConstellationModeChange('date')
                  setShowModeMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: constellationMode === 'date' ? 'rgba(74,144,226,0.12)' : 'transparent',
                  color: constellationMode === 'date' ? 'var(--primary-dark)' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                }}
              >
                {T.constellationByDate}
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 140px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--k-up)',
              fontWeight: 600,
              marginBottom: '0.35rem',
            }}
          >
            {T.todayYi}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text)',
              lineHeight: 1.7,
            }}
          >
            {fortune.yi.join(' · ')}
          </div>
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--k-down)',
              fontWeight: 600,
              marginBottom: '0.35rem',
            }}
          >
            {T.todayJi}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            {fortune.ji.join(' · ')}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}
      >
        {fortune.tip}
      </div>
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f3f4f6',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          whiteSpace: 'pre-line',
        }}
      >
        {T.footnote}
      </div>
    </section>
  )
}
