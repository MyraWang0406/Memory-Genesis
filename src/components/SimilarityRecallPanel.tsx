import type { MemoryEvent } from '../data/memoryEvents'
import { DEMO_EVENTS } from '../data/memoryEvents'

interface RecallItem {
  eventId: string
  score: number
  reason: string
  warningPatterns: string[]
  preemptiveAdvice: string
}

interface Props {
  recalls: RecallItem[]
}

export function SimilarityRecallPanel({ recalls }: Props) {
  const getEvent = (id: string): MemoryEvent | undefined => DEMO_EVENTS.find(e => e.id === id)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(139,92,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>🔍 相似事件召回</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>基于历史记忆匹配</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {recalls.map((recall, i) => {
          const ev = getEvent(recall.eventId)
          if (!ev) return null
          return (
            <div key={recall.eventId} style={{
              background: 'var(--card-bg)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {/* similarity bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, #8b5cf6 ${recall.score * 100}%, #e5e7eb ${recall.score * 100}%)` }} />
              <div style={{ padding: '0.9rem 1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>#{i + 1} {ev.title}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '0.15rem 0.5rem', borderRadius: 6 }}>相似度 {Math.round(recall.score * 100)}%</div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.6rem', lineHeight: 1.55 }}>
                  <strong style={{ color: 'var(--text)' }}>为什么相似：</strong> {recall.reason}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                  {recall.warningPatterns.map(p => (
                    <span key={p} style={{ padding: '0.15rem 0.5rem', borderRadius: 8, fontSize: '0.72rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontWeight: 600 }}>⚠ {p}</span>
                  ))}
                </div>

                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ 这次提前注意 · </span>
                  <span style={{ fontSize: '0.82rem', color: '#15803d' }}>{recall.preemptiveAdvice}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
