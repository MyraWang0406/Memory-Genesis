import { useState } from 'react'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { addRegret } from '../store'
import { genId } from '../utils/id'
import { syncRegret } from '../services/evermemos'

interface Props {
  lang: Lang
  profileId: string
  date: string
  recordId: string
  onClose: () => void
}

export function RegretModal({ lang, profileId, date, recordId, onClose }: Props) {
  const T = getText(lang)
  const [goal, setGoal] = useState('')
  const [loss, setLoss] = useState('')
  const [need, setNeed] = useState('')
  const [trigger, setTrigger] = useState('')

  const handleSave = () => {
    const archive = {
      id: genId(),
      profileId,
      date,
      recordId,
      goal: goal.trim() || '-',
      loss: loss.trim() || '-',
      need: need.trim() || '-',
      trigger: trigger.trim() || '-',
      createdAt: new Date().toISOString(),
    }
    addRegret(archive)
    syncRegret(profileId, { date, goal: archive.goal, loss: archive.loss, need: archive.need, trigger: archive.trigger }).catch(() => {})
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
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
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
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
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{T.regretArchive}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {T.regretDescAi}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {lang === 'zh' ? '留档后，复盘与模拟推演中将按「法·事·情·人」给建议：方法、事实、情绪、换位求共赢。' : 'After archiving, advice in review and simulate will follow Method · Facts · Emotion · People (win-win).'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.regretGoal}</label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={lang === 'zh' ? '当时真正想要的…' : 'What you really wanted…'}
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.regretLoss}</label>
            <input
              value={loss}
              onChange={(e) => setLoss(e.target.value)}
              placeholder={lang === 'zh' ? '时间/机会/情绪/关系…' : 'Time/opportunity/mood/relationship…'}
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.regretNeed}</label>
            <input
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              placeholder={lang === 'zh' ? '安全感/认可/掌控/自由/被爱…' : 'Security/recognition/control/freedom/love…'}
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{T.regretTrigger}</label>
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder={lang === 'zh' ? '压力/被否定/熬夜/孤独/冲动…' : 'Stress/rejection/late night/loneliness/impulse…'}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginTop: '0.25rem',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {lang === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: 8,
              background: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {lang === 'zh' ? '留档' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  )
}
