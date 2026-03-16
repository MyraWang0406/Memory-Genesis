import { useState } from 'react'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { loadProfiles, getCurrentProfileId, setCurrentProfileId } from '../store'
import { ProfileSetupView } from './ProfileSetupView'

interface Props {
  lang: Lang
  onDone: () => void
}

export function ProfileView({ lang, onDone }: Props) {
  const T = getText(lang)
  const profiles = loadProfiles()
  const currentId = getCurrentProfileId()
  const [formProfileId, setFormProfileId] = useState<string | null>(profiles.length === 0 ? '' : null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  if (formProfileId !== null) {
    return (
      <ProfileSetupView
        lang={lang}
        initialProfileId={formProfileId === '' ? undefined : formProfileId}
        onDone={() => {
          setFormProfileId(null)
          onDone()
        }}
      />
    )
  }

  if (profiles.length === 0) {
    return (
      <ProfileSetupView
        lang={lang}
        onDone={onDone}
      />
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => { setAuthMode('login'); setAuthModalOpen(true) }}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          {T.login}
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('register'); setAuthModalOpen(true) }}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            border: 'none',
            borderRadius: 8,
            background: 'var(--primary)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {T.register}
        </button>
      </div>
      {authModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: 12,
              padding: '1.5rem',
              maxWidth: 360,
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              aria-label={lang === 'zh' ? '关闭' : 'Close'}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                padding: 0,
                border: 'none',
                borderRadius: '50%',
                background: 'var(--text-muted)',
                color: 'white',
                fontSize: '1.1rem',
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              {authMode === 'login' ? T.login : T.register}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
              {lang === 'zh' ? '当前为本地档案，无需账号即可使用；如需云端同步可配置 EverMemOS。' : 'Local profile — no account needed. Configure EverMemOS for cloud sync.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setAuthModalOpen(false); /* 邮箱注册：此处可接后端 */ }}
                style={{
                  padding: '0.6rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {T.loginWithEmail}
              </button>
              <button
                type="button"
                onClick={() => { setAuthModalOpen(false); /* Gmail OAuth：此处可接 Google 登录 */ }}
                style={{
                  padding: '0.6rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {T.loginWithGmail}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              style={{
                marginTop: '1rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>{lang === 'zh' ? '选择档案' : 'Select profile'}</h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {profiles.map((p) => (
            <li
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span style={{ fontWeight: currentId === p.id ? 600 : 400 }}>
                {p.name || p.birthDate || p.id.slice(0, 8)}
              </span>
              <span style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentProfileId(p.id)
                    onDone()
                  }}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--primary)',
                    borderRadius: 6,
                    background: 'transparent',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'zh' ? '使用' : 'Use'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormProfileId(p.id)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.85rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {T.edit}
                </button>
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setFormProfileId('')}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            border: '1px dashed #e5e7eb',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
        >
          + {lang === 'zh' ? '新建档案' : 'New profile'}
        </button>
      </div>
    </div>
  )
}
