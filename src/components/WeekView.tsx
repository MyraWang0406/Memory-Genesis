import { useMemo, useState } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { loadDays } from '../store'
import { GoBoard } from './GoBoard'
import { MemoEventList } from './MemoEventList'
import { EmotionRecord } from './EmotionRecord'
import { MemoWhatIf } from './MemoWhatIf'
import type { TimelineEntry } from '../types'

interface Props {
  date: Date
  lang: Lang
  profileId: string | null
}

interface KPoint {
  date: string
  score: number | null
  label: string
}

const localeMap = { zh: zhCN, en: enUS }
const WEEKDAY_LABELS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// 计算周数
const getWeekNumber = (d: Date) => {
  const firstDay = new Date(d.getFullYear(), 0, 1)
  const pastDaysOfYear = (d.getTime() - firstDay.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7)
}

export function WeekView({ date, lang, profileId }: Props) {
  const T = getText(lang)
  const [draftMood, setDraftMood] = useState<number | null>(null)
  const [draftTimeline, setDraftTimeline] = useState<TimelineEntry[]>([])
  const weekStart = startOfWeek(date, { weekStartsOn: 0 }) // 0 = Sunday
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const allRecords = profileId ? loadDays(profileId) : []

  // 计算周标签
  const weekNumber = getWeekNumber(weekStart)
  const monthName = lang === 'zh' 
    ? `${weekStart.getMonth() + 1}月` 
    : format(weekStart, 'MMMM', { locale: localeMap[lang] })
  const weekLabel = lang === 'zh'
    ? `${monthName}第${weekNumber}周`
    : `${weekNumber}${['st', 'nd', 'rd'][weekNumber % 10 - 1] || 'th'} week of ${monthName}`

  const points: KPoint[] = useMemo(() => {
    return days.map((d) => {
      const ds = format(d, 'yyyy-MM-dd')
      const rec = allRecords.find((r) => r.date === ds)
      const score = rec?.moodScore ?? (profileId ? null : 4 + (d.getDay() % 3))
      return { date: ds, score: profileId ? (rec?.moodScore ?? null) : score, label: format(d, 'M/d', { locale: localeMap[lang] }) }
    })
  }, [days, allRecords, lang, profileId])

  const validScores = points.map((p) => p.score).filter((s): s is number => s != null && !isNaN(s))
  const totalMoves = profileId ? days.reduce((acc, d) => {
    const ds = format(d, 'yyyy-MM-dd')
    const rec = allRecords.find((r) => r.date === ds)
    if (!rec) return acc
    return acc + (rec.timeline?.length ?? 0) + (rec.moodScore != null ? 1 : 0) + (rec.edits ?? 0)
  }, 0) : 6

  const weekdayLabels = lang === 'zh' ? WEEKDAY_LABELS_ZH : WEEKDAY_LABELS_EN

  return (
    <div className="week-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 7天展开视图 */}
      <section style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{weekLabel}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {days.map((d, i) => {
            const ds = format(d, 'yyyy-MM-dd')
            const rec = allRecords.find((r) => r.date === ds)
            const isWeekend = i === 0 || i === 6
            const isToday = ds === format(new Date(), 'yyyy-MM-dd')
            return (
              <div key={ds} style={{
                border: isToday ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '0.65rem 0.5rem',
                background: isToday ? 'rgba(59,130,246,0.04)' : 'white',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isWeekend ? '#ef4444' : '#374151', marginBottom: '0.25rem' }}>
                  {weekdayLabels[i]}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isWeekend ? '#ef4444' : '#111827', marginBottom: '0.5rem' }}>
                  {format(d, 'd')}
                </div>
                {rec?.moodScore != null && (
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                    {['😢', '😕', '😐', '🙂', '😊', '😁', '😄', '🤩', '😍', '✨', '🌟'][rec.moodScore]}
                  </div>
                )}
                {rec?.timeline && rec.timeline.length > 0 && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {rec.timeline.length} {lang === 'zh' ? '条记录' : 'records'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <EmotionRecord score={draftMood} lang={lang} onChange={setDraftMood} />
      <MemoWhatIf entries={draftTimeline} lang={lang} onEntriesChange={setDraftTimeline} hasProfile={false} />
      <MemoEventList startDate={format(weekStart, 'yyyy-MM-dd')} endDate={format(addDays(weekStart,6), 'yyyy-MM-dd')} label={lang === 'zh' ? '本周事件' : 'Weekly Events'} lang={lang} />
      <GoBoard scores={validScores.length ? validScores : [5]} moves={totalMoves} edits={0} lang={lang} />
    </div>
  )
}
