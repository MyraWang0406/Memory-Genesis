import type { TimelineEntry as Entry } from '../types'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { genId } from '../utils/id'

interface Props {
  entries: Entry[]
  lang: Lang
  onEntriesChange: (entries: Entry[]) => void
}

export function Timeline({ entries, lang, onEntriesChange }: Props) {
  const T = getText(lang)

  const addEntry = () => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    onEntriesChange([
      ...entries,
      { id: genId(), time, tags: [], memo: '', createdAt: now.toISOString(), tagType: '心情随感' },
    ])
  }

  const updateEntry = (id: string, patch: Partial<Entry>) => {
    onEntriesChange(
      entries.map((e) => (e.id === id ? { ...e, ...patch } : e))
    )
  }

  const removeEntry = (id: string) => {
    onEntriesChange(entries.filter((e) => e.id !== id))
  }

  const sorted = [...entries].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <section
      className="timeline"
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
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--text)',
          }}
        >
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
        }}
      >
        {sorted.map((e) => (
          <div
            key={e.id}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              position: 'relative',
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
                {e.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(74,144,226,0.15)',
                      color: 'var(--primary-dark)',
                      borderRadius: 6,
                    }}
                  >
                    {t}
                  </span>
                ))}
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
    </section>
  )
}
