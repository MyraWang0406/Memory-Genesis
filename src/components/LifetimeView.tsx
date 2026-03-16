import { useMemo, useState } from 'react'
import type { Lang } from '../i18n'
import { loadDays } from '../store'
import { GoBoard } from './GoBoard'
import { EmotionRecord } from './EmotionRecord'
import { MemoWhatIf } from './MemoWhatIf'
import type { TimelineEntry } from '../types'

interface Props {
  date: Date
  lang: Lang
  profileId: string | null
}

export function LifetimeView({ date: _date, lang, profileId }: Props) {
  const [draftMood, setDraftMood] = useState<number | null>(null)
  const [draftTimeline, setDraftTimeline] = useState<TimelineEntry[]>([])
  const allRecords = loadDays(profileId)
  const sorted = useMemo(() => [...allRecords].sort((a, b) => a.date.localeCompare(b.date)), [allRecords])

  const byYear = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const r of sorted) {
      const y = r.date.slice(0, 4)
      if (r.moodScore != null && !isNaN(r.moodScore)) {
        if (!map.has(y)) map.set(y, [])
        map.get(y)!.push(r.moodScore)
      }
    }
    return map
  }, [sorted])

  const validScores = useMemo(() => {
    if (!profileId) {
      const lifeCurveScore = (age: number): number => {
        if (age <= 0) return 48
        if (age <= 20) return 45 + (age / 20) * 12
        if (age <= 29) return 57 - (age - 20) * (22 / 9)
        if (age <= 50) return 35 + (age - 29) * (30 / 21)
        if (age <= 80) return 65 + (age - 50) * (28 / 30)
        return Math.max(72, 93 - (age - 80) * 1.4)
      }
      const currentYear = new Date().getFullYear()
      const baseYear = currentYear - 50
      return Array.from({ length: 90 }, (_, i) => {
        const age = i + 1
        return Math.round(lifeCurveScore(age) * 10) / 10
      })
    }
    const years = Array.from(byYear.keys()).sort()
    return years.map((y) => {
      const scores = byYear.get(y)!
      return scores.reduce((a, b) => a + b, 0) / scores.length
    })
  }, [byYear, profileId])
  
  const totalMoves = profileId ? allRecords.reduce((acc, r) => acc + (r.timeline?.length ?? 0) + (r.edits ?? 0), 0) : 30

  return (
    <div className="lifetime-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <EmotionRecord score={draftMood} lang={lang} onChange={setDraftMood} />
      <MemoWhatIf entries={draftTimeline} lang={lang} onEntriesChange={setDraftTimeline} hasProfile={false} />
      <GoBoard scores={validScores.length ? validScores : [5]} moves={totalMoves} edits={0} lang={lang} />
    </div>
  )
}
