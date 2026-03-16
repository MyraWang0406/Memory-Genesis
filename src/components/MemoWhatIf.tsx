import { useState } from 'react'
import type { TimelineEntry } from '../types'
import type { MemoTagType } from '../types'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { genId } from '../utils/id'

const TAG_TYPES: MemoTagType[] = ['心情随感', '职场随记', '设想推演']

interface Props {
  entries: TimelineEntry[]
  lang: Lang
  onEntriesChange: (entries: TimelineEntry[]) => void
  hasProfile?: boolean
  onNeedProfile?: () => void
}

export function MemoWhatIf({ entries, lang, onEntriesChange, hasProfile, onNeedProfile }: Props) {
  const T = getText(lang)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const tagLabels: Record<MemoTagType, string> = {
    心情随感: T.tagTypeMood,
    职场随记: T.tagTypeWork,
    设想推演: T.tagTypeWhatIf,
  }

  const addEntry = () => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    onEntriesChange([
      ...entries,
      {
        id: genId(),
        time,
        tagType: '心情随感',
        tags: [],
        memo: '',
        createdAt: now.toISOString(),
      },
    ])
  }

  const updateEntry = (id: string, patch: Partial<TimelineEntry>) => {
    onEntriesChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const removeEntry = (id: string) => {
    onEntriesChange(entries.filter((e) => e.id !== id))
  }

  const sorted = [...entries].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <section
      className="memo-whatif"
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
          {T.timeline}
        </h3>
        <button
          type="button"
          onClick={addEntry}
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.85rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          + {T.addRecord}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sorted.map((e) => (
          <div
            key={e.id}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 56,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--primary)',
              }}
            >
              {e.time}
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                borderLeft: '2px solid var(--board-line)',
                paddingLeft: '1rem',
                paddingBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {TAG_TYPES.map((t) => {
                  const current = e.tagType ?? '心情随感'
                  return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateEntry(e.id, { tagType: t })}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      border: current === t ? '1px solid var(--primary)' : '1px solid #e5e7eb',
                      borderRadius: 6,
                      background: current === t ? 'rgba(74,144,226,0.12)' : 'transparent',
                      color: current === t ? 'var(--primary-dark)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {tagLabels[t]}
                  </button>
                )})}
                <input
                  type="text"
                  placeholder={T.addTag}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter') {
                      const v = ev.currentTarget.value.trim()
                      if (v) {
                        updateEntry(e.id, { tags: [...e.tags, v] })
                        ev.currentTarget.value = ''
                      }
                    }
                  }}
                  style={{
                    width: 80,
                    fontSize: '0.8rem',
                    padding: '0.2rem 0.4rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                  }}
                />
              </div>
              <textarea
                value={e.memo}
                onChange={(ev) => updateEntry(e.id, { memo: ev.target.value })}
                placeholder={T.memoPlaceholder}
                rows={2}
                style={{
                  width: '100%',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeEntry(e.id)}
              style={{
                flexShrink: 0,
                padding: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              title={T.regretMove}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            if (hasProfile) return
            setShowSavePrompt(true)
          }}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {T.saveBtn}
        </button>
      </div>
      {showSavePrompt && (
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
          onClick={() => setShowSavePrompt(false)}
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
              onClick={() => setShowSavePrompt(false)}
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
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', color: 'var(--text)' }}>
              {T.savePromptMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { onNeedProfile?.(); setShowSavePrompt(false) }}
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
                {T.goLoginRegister}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
