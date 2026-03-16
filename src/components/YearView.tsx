import { useMemo, useState } from 'react'
import { format, startOfYear, addMonths } from 'date-fns'
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

export function YearView({ date, lang, profileId }: Props) {
  const T = getText(lang)
  const yearStart = startOfYear(date)
  const [draftMood, setDraftMood] = useState<number | null>(null)
  const [draftTimeline, setDraftTimeline] = useState<TimelineEntry[]>([])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i)), [yearStart])
  const allRecords = profileId ? loadDays(profileId) : []

  const validScores = months.map((m, i) => {
    if (!profileId) return 4 + (i % 5)
    const monthStr = format(m, 'yyyy-MM')
    const monthRecs = allRecords.filter((r) => r.date.startsWith(monthStr))
    const scores = monthRecs.map((r) => r.moodScore).filter((s): s is number => s != null && !isNaN(s))
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    return avg
  }).filter((s): s is number => s != null && !isNaN(s))
  
  const totalMoves = profileId ? allRecords.reduce((acc, r) => acc + (r.timeline?.length ?? 0) + (r.edits ?? 0), 0) : 24

  return (
    <div className="year-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <EmotionRecord score={draftMood} lang={lang} onChange={setDraftMood} />
      <MemoWhatIf entries={draftTimeline} lang={lang} onEntriesChange={setDraftTimeline} hasProfile={false} />
      <GoBoard scores={validScores.length ? validScores : [5]} moves={totalMoves} edits={0} lang={lang} />
    </div>
  )
}
