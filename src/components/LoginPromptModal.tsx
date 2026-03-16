import type { Lang } from '../i18n'
import { getText } from '../i18n'

interface Props {
  lang: Lang
  onGoProfile: () => void
  onClose: () => void
}

export function LoginPromptModal({ lang, onGoProfile, onClose }: Props) {
  const T = getText(lang)
  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 12,
          padding: '1.5rem',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'zh' ? '关闭' : 'Close'}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
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
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>{T.loginPromptTitle}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
          {T.loginPromptDesc}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
          {lang === 'zh' ? '当前为本地档案，无需登录；请先到「档案维护」创建或选择档案即可使用。' : 'Local profile only — no login required. Create or select a profile in Profile to start.'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {lang === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onGoProfile}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: 8,
              background: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {T.loginPromptAction}
          </button>
        </div>
      </div>
    </div>
  )
}
