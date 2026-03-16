import type { MemoryEvent, RecurringPattern } from '../data/memoryEvents'
import { EventCard } from './EventCard'

const SEVERITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const SEVERITY_LABEL = { low: '低', medium: '中', high: '高' }

function PatternCard({ pattern }: { pattern: RecurringPattern }) {
  const color = SEVERITY_COLOR[pattern.severity]
  return (
    <div style={{ background: 'var(--card-bg)', border: `1px solid ${color}30`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '0.85rem 1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{pattern.label}</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 6, background: `${color}15`, color, fontWeight: 700 }}>严重度 {SEVERITY_LABEL[pattern.severity]}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>出现 {pattern.occurrences} 次</span>
        </div>
      </div>
      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{pattern.description}</div>
    </div>
  )
}

interface Props {
  events: MemoryEvent[]
  patterns: RecurringPattern[]
}

export function MemoryTimeline({ events, patterns }: Props) {
  return (
    <div>
      {/* events timeline */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>📅 事件时间线</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{events.length} 个历史事件</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)', borderRadius: 2 }} />
          {events.map((ev) => (
            <div key={ev.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', border: '2px solid white', boxShadow: '0 0 0 2px #3b82f6', flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1 }}>
                <EventCard event={ev} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* patterns */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(239,68,68,0.1)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>🔁 重复误判模式</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>系统识别到 {patterns.length} 类高频误判</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
        </div>
      </div>
    </div>
  )
}
