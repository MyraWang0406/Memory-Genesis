import { useState } from 'react'
import type { MemoryEvent } from '../data/memoryEvents'
import { RoleCard } from './RoleCard'

const TYPE_LABEL: Record<string, string> = {
  interview: '面试', negotiation: '谈判', collaboration: '合作', project: '项目', other: '其他',
}
const TYPE_COLOR: Record<string, string> = {
  interview: '#6366f1', negotiation: '#f59e0b', collaboration: '#22c55e', project: '#3b82f6', other: '#6b7280',
}

interface Props {
  event: MemoryEvent
  highlight?: boolean
  compact?: boolean
}

export function EventCard({ event, highlight, compact }: Props) {
  const [expanded, setExpanded] = useState(false)
  const color = TYPE_COLOR[event.type] ?? '#6b7280'

  return (
    <div style={{
      background: highlight ? 'linear-gradient(135deg, #0f172a, #1e293b)' : 'var(--card-bg)',
      border: `1px solid ${highlight ? 'rgba(99,102,241,0.4)' : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 14,
      padding: '1.1rem 1.25rem',
      boxShadow: highlight ? '0 4px 20px rgba(99,102,241,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.15rem 0.55rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: `${color}18`, color }}>{TYPE_LABEL[event.type]}</span>
            <span style={{ fontSize: '0.75rem', color: highlight ? '#64748b' : 'var(--text-muted)' }}>{event.date}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: highlight ? 'white' : 'var(--text)' }}>{event.title}</div>
        </div>
        {!compact && (
          <button type="button" onClick={() => setExpanded(e => !e)}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', border: `1px solid ${highlight ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}`, borderRadius: 6, background: 'transparent', color: highlight ? '#94a3b8' : 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
            {expanded ? '收起' : '展开'}
          </button>
        )}
      </div>

      {/* quick stats */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        {event.tags.map(t => (
          <span key={t} style={{ padding: '0.1rem 0.45rem', borderRadius: 10, fontSize: '0.68rem', background: highlight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: highlight ? '#94a3b8' : 'var(--text-muted)' }}>{t}</span>
        ))}
      </div>

      {/* misjudgment pill — always visible */}
      {event.misjudgment && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.45rem 0.75rem', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>误判 · </span>
          <span style={{ fontSize: '0.82rem', color: highlight ? '#fca5a5' : '#b91c1c' }}>{event.misjudgment}</span>
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: '我的目标', value: event.myGoal, accent: '#3b82f6' },
            { label: '约束条件', value: event.constraints, accent: '#f59e0b' },
            { label: '我的行动', value: event.actions, accent: '#6366f1' },
            { label: '最终结果', value: event.result, accent: '#22c55e' },
            { label: '下次会怎么做', value: event.nextTimeWouldDo, accent: '#8b5cf6' },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{label}</div>
              <div style={{ fontSize: '0.85rem', color: highlight ? '#cbd5e1' : 'var(--text)', lineHeight: 1.55 }}>{value}</div>
            </div>
          ))}

          {/* roles */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>角色建模</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {event.roles.map(r => <RoleCard key={r.id} role={r} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
