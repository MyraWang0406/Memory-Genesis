import { useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns'
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

function startOfQuarter(d: Date): Date {
  const month = d.getMonth()
  const startMonth = Math.floor(month / 3) * 3
  return startOfMonth(new Date(d.getFullYear(), startMonth, 1))
}

export function QuarterView({ date, lang, profileId }: Props) {
  const T = getText(lang)
  const [draftMood, setDraftMood] = useState<number | null>(null)
  const [draftTimeline, setDraftTimeline] = useState<TimelineEntry[]>([])
  const start = useMemo(() => startOfQuarter(date), [date])
  const end = useMemo(() => endOfMonth(addMonths(start, 2)), [start])
  const quarterDays = useMemo(() => eachDayOfInterval({ start, end }), [start, end])
  const allRecords = profileId ? loadDays(profileId) : []

  const validScores = quarterDays.map((d, i) => {
    const ds = format(d, 'yyyy-MM-dd')
    const rec = allRecords.find((r) => r.date === ds)
    const score = rec?.moodScore ?? (profileId ? null : 4 + (i % 7) % 5)
    return score
  }).filter((s): s is number => s != null && !isNaN(s))
  
  const totalMoves = profileId ? quarterDays.reduce((acc, d) => {
    const ds = format(d, 'yyyy-MM-dd')
    const rec = allRecords.find((r) => r.date === ds)
    if (!rec) return acc
    return acc + (rec.timeline?.length ?? 0) + (rec.edits ?? 0)
  }, 0) : 18

  return (
    <div className="quarter-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <EmotionRecord score={draftMood} lang={lang} onChange={setDraftMood} />
      <MemoWhatIf entries={draftTimeline} lang={lang} onEntriesChange={setDraftTimeline} hasProfile={false} />
      <GoBoard scores={validScores.length ? validScores : [5]} moves={totalMoves} edits={0} lang={lang} />
    </div>
  )
}
