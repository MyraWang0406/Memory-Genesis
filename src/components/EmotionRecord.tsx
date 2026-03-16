import type { Lang } from '../i18n'
import { getText } from '../i18n'

const FACES = ['😢', '😕', '😐', '🙂', '😊', '😁', '😄', '🤩', '😍', '✨', '🌟']

interface Props {
  score: number | null
  lang: Lang
  onChange: (v: number | null) => void
}

export function EmotionRecord({ score, lang, onChange }: Props) {
  const T = getText(lang)
  return (
    <section
      className="emotion-record"
      style={{
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <h3
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          margin: '0 0 0.35rem 0',
          color: 'var(--text)',
        }}
      >
        {T.emotionRecord}
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
        {T.moodHint}
      </p>
      <ScorePicker value={score} onChange={onChange} />
    </section>
  )
}

function ScorePicker({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.25rem',
        alignItems: 'center',
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onContextMenu={(e) => {
            e.preventDefault()
            onChange(null)
          }}
          title="右键清空"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: value === n ? '2px solid var(--primary)' : '1px solid #e5e7eb',
            background: value === n ? 'rgba(74,144,226,0.1)' : 'transparent',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {FACES[n]}
        </button>
      ))}
    </div>
  )
}
