import { useState, useEffect } from 'react'
import { getEventsInRange, subscribeEvents } from '../services/eventStore'
import type { MemoryEvent } from '../data/memoryEvents'
import { EventCard } from './EventCard'
import { EventWorkspace } from './EventWorkspace'
import { addEvent } from '../services/eventStore'
import type { Lang } from '../i18n'

interface Props {
  startDate: string  // yyyy-MM-dd
  endDate: string    // yyyy-MM-dd
  label?: string
  lang: Lang
}

export function MemoEventList({ startDate, endDate, label, lang }: Props) {
  const [events, setEvents] = useState<MemoryEvent[]>(() => getEventsInRange(startDate, endDate))
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const unsub = subscribeEvents(() => setEvents(getEventsInRange(startDate, endDate)))
    return unsub
  }, [startDate, endDate])

  const visible = expanded ? events : events.slice(0, 3)

  return (
    <section style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
          📝 {label ?? (lang === 'zh' ? '事件备忘' : 'Event Memo')}
          {events.length > 0 && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{events.length} {lang === 'zh' ? '条' : 'items'}</span>}
        </h3>
        <button type="button" onClick={() => setShowWorkspace(v => !v)}
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: 7, background: showWorkspace ? 'var(--primary)' : 'rgba(59,130,246,0.1)', color: showWorkspace ? 'white' : 'var(--primary-dark)', cursor: 'pointer' }}>
          {showWorkspace ? (lang === 'zh' ? '收起' : 'Collapse') : (lang === 'zh' ? '+ 记录事件' : '+ Record Event')}
        </button>
      </div>

      {showWorkspace && (
        <div style={{ marginBottom: '1rem', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '0.85rem', background: 'rgba(59,130,246,0.02)' }}>
          <EventWorkspace inline
            lang={lang}
            onSave={(ev) => { addEvent(ev); setShowWorkspace(false) }}
            onClose={() => setShowWorkspace(false)}
          />
        </div>
      )}

      {events.length === 0 && !showWorkspace && (
        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>{lang === 'zh' ? '暂无事件记录' : 'No event records'}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visible.map(ev => <EventCard key={ev.id} event={ev} compact />)}
      </div>

      {events.length > 3 && (
        <button type="button" onClick={() => setExpanded(v => !v)}
          style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {expanded ? (lang === 'zh' ? '收起' : 'Collapse') : (lang === 'zh' ? `查看全部 ${events.length} 条 ↓` : `View all ${events.length} items ↓`)}
        </button>
      )}
    </section>
  )
}
