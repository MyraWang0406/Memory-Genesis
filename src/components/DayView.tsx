import { useCallback, useState } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import type { DayRecord, TimelineEntry } from '../types'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { parseISO } from 'date-fns'
import { getFortune, getConstellation } from '../utils/zodiac'
import { getDayRecord, upsertDayRecord, loadRegrets, loadConstellationMode, saveConstellationMode } from '../store'
import { genId } from '../utils/id'
import { EmotionCalendar } from './EmotionCalendar'
import { EmotionRecord } from './EmotionRecord'
import { MemoWhatIf } from './MemoWhatIf'
import { GoBoard } from './GoBoard'
import { RegretModal } from './RegretModal'
import { searchMemories, isEverMemOSEnabled, syncDaySummary, syncWhatIf } from '../services/evermemos'
import { getMockScenario } from '../services/mockDemoService'
import { DecisionReviewModal } from './DecisionReviewModal'
import { AdvicePanel } from './AdvicePanel'

interface Props {
  date: Date
  lang: Lang
  profileId: string | null
  currentProfile: import('../types').Profile | null
  onNeedProfile: () => void
}

function FutureReminderBanner({ lang, profileId }: { lang: Lang; profileId: string | null }) {
  const T = getText(lang)
  const [searching, setSearching] = useState(false)
  const [similarMemories, setSimilarMemories] = useState<unknown[]>([])
  const [mockData, setMockData] = useState<ReturnType<typeof getMockScenario>>(null)
  
  const params = new URLSearchParams(window.location.search)
  const demoKey = params.get('demo')
  const isDemo = !!demoKey && ['effort', 'path', 'protect'].includes(demoKey)

  const regrets = loadRegrets(profileId)
  if (regrets.length === 0 && !isDemo) return null

  const handleSimulate = async () => {
    setSearching(true)
    setSimilarMemories([])
    setMockData(null)
    
    if (isDemo) {
      // Demo mode: artificial delay then show mock data
      await new Promise(r => setTimeout(r, 800))
      setMockData(getMockScenario(demoKey, lang))
      setSearching(false)
      return
    }

    if (!profileId) { setSearching(false); return }
    try {
      const res = await searchMemories(profileId, '过去类似场景的内耗或冲动决策与触发场景', { memoryTypes: ['event_log', 'episodic_memory'], topK: 5 })
      if (res.ok && res.memories) setSimilarMemories(Array.isArray(res.memories) ? res.memories : [])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        background: 'rgba(74,144,226,0.08)',
        borderRadius: 8,
        fontSize: '0.85rem',
        color: 'var(--primary-dark)',
        border: '1px solid rgba(74,144,226,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>{T.futureReminder}</span>
        {profileId && isEverMemOSEnabled() && (
          <button
            type="button"
            onClick={handleSimulate}
            disabled={searching}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              border: '1px solid var(--primary)',
              borderRadius: 6,
              background: 'transparent',
              color: 'var(--primary)',
              cursor: searching ? 'wait' : 'pointer',
            }}
          >
            {searching ? (lang === 'zh' ? '检索中…' : 'Searching…') : (lang === 'zh' ? '模拟落子推演' : 'Simulate')}
          </button>
        )}
      </div>
      {similarMemories.length > 0 && (
        <>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lang === 'zh' ? '类似过往：' : 'Similar past: '}
            {JSON.stringify(similarMemories).slice(0, 200)}…
          </div>
          <AdvicePanel lang={lang} compact />
        </>
      )}
      {mockData && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
              {lang === 'zh' ? '过去对话' : 'Past Dialogue'}
            </div>
            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text)' }}>{mockData.pastDialogue}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
              {lang === 'zh' ? '提取记忆' : 'Extracted Memory'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{mockData.extractedMemory}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: 8, border: '1px dashed rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
              {lang === 'zh' ? '隐藏背景' : 'Hidden Context'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{mockData.hiddenContext}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(74,144,226,0.05)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
              {lang === 'zh' ? '识别模式' : 'Inferred Pattern'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{mockData.inferredPattern}</div>
          </div>
          <AdvicePanel 
            lang={lang} 
            compact 
            content={{ 
              fa: mockData.coachResponse,
              shi: lang === 'zh' ? '基于当时生态位与资源的必然选择' : 'Inevitable choice based on ecosystem and resources',
              qing: lang === 'zh' ? '接纳当时的自我保护本能' : 'Accept the self-protection instinct at that time',
              ren: lang === 'zh' ? '看清系统性影响而非个人缺失' : 'See systemic impact rather than personal lack'
            }} 
          />
        </div>
      )}
    </div>
  )
}

export function DayView({ date, lang, profileId, currentProfile, onNeedProfile }: Props) {
  const [, setRefresh] = useState(0)
  const [showRegret, setShowRegret] = useState(false)
  const [showDecisionReview, setShowDecisionReview] = useState(false)
  const [draftTimeline, setDraftTimeline] = useState<TimelineEntry[]>([])
  const [draftMood, setDraftMood] = useState<number | null>(null)
  const [draftWhatIfContext, setDraftWhatIfContext] = useState('')
  const isPast = isBefore(startOfDay(date), startOfDay(new Date()))
  const dateStr = format(date, 'yyyy-MM-dd')
  const stored = profileId ? getDayRecord(dateStr, profileId) : null
  const legacy = stored as (DayRecord & { expectedScore?: number | null; actualScore?: number | null }) | null
  const record: DayRecord = legacy
    ? {
        ...legacy,
        profileId: legacy.profileId ?? profileId ?? '',
        moodScore: legacy.moodScore ?? legacy.actualScore ?? legacy.expectedScore ?? null,
        timeline: (legacy.timeline ?? []).map((e) => ({
          ...e,
          tagType: (e as TimelineEntry).tagType ?? '心情随感',
        })),
      }
    : {
        id: genId(),
        profileId: profileId ?? '',
        date: dateStr,
        moodScore: null,
        timeline: [],
        edits: 0,
      }

  const displayTimeline = profileId ? record.timeline : draftTimeline
  const displayMood = profileId ? record.moodScore : draftMood
  const displayWhatIfContext = profileId ? (record.whatIfContext ?? '') : draftWhatIfContext

  const constellationMode = loadConstellationMode()
  let fortune = getFortune(date, lang)
  if (constellationMode === 'profile' && currentProfile?.birthDate) {
    fortune = { ...fortune, constellation: getConstellation(parseISO(currentProfile.birthDate), lang) }
  }

  const persist = useCallback(
    (patch: Partial<DayRecord>) => {
      if (!profileId) return
      const isEdit =
        patch.moodScore !== undefined ||
        patch.timeline !== undefined
      const next: DayRecord = {
        ...record,
        ...patch,
        profileId,
        edits: isEdit ? record.edits + 1 : record.edits,
      }
      upsertDayRecord(next)
      if (isEverMemOSEnabled() && (patch.moodScore !== undefined || patch.timeline !== undefined)) {
        syncDaySummary(profileId, next.date, next.moodScore ?? null, next.timeline?.length ?? 0).catch(() => {})
      }
      setRefresh((r) => r + 1)
    },
    [record, profileId]
  )

  const handleMoodChange = useCallback(
    (v: number | null) => {
      if (profileId) {
        persist({ moodScore: v })
      } else {
        setDraftMood(v)
      }
    },
    [persist, profileId]
  )

  const handleTimelineChange = useCallback(
    (timeline: TimelineEntry[]) => {
      if (profileId) {
        persist({ timeline })
      } else {
        setDraftTimeline(timeline)
      }
    },
    [persist, profileId]
  )

  const moves = (displayTimeline?.length ?? 0) + (displayMood != null ? 1 : 0)
  const scores = [displayMood].filter((s): s is number => s != null && !isNaN(s))

  return (
    <div className="day-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FutureReminderBanner lang={lang} profileId={profileId} />
      <EmotionCalendar
        fortune={fortune}
        lang={lang}
        constellationMode={constellationMode}
        onConstellationModeChange={(m) => { saveConstellationMode(m); setRefresh((r) => r + 1) }}
        hasProfile={!!profileId}
        profileBirthDate={currentProfile?.birthDate}
      />
      <EmotionRecord
        score={displayMood}
        lang={lang}
        onChange={handleMoodChange}
      />
      <MemoWhatIf
        entries={displayTimeline}
        lang={lang}
        onEntriesChange={handleTimelineChange}
        hasProfile={!!profileId}
        onNeedProfile={onNeedProfile}
      />
      <GoBoard
        scores={scores.length ? scores : [5]}
        moves={moves}
        edits={record.edits}
        lang={lang}
        whatIfContext={displayWhatIfContext}
        onWhatIfContextChange={(v) => {
          if (profileId) {
            persist({ whatIfContext: v })
            if (isEverMemOSEnabled()) {
              syncWhatIf(profileId, dateStr, v).catch(() => {})
            }
          } else {
            setDraftWhatIfContext(v)
          }
        }}
      />
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowDecisionReview(true)}
          style={{ alignSelf: 'flex-start', padding: '0.5rem 1.1rem', fontSize: '0.85rem', border: 'none', borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #4A90E2)', color: 'white', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }}
        >
          {lang === 'zh' ? '🔍 决策复盘' : '🔍 Decision Review'}
        </button>
        {isPast && record.edits > 0 && (
          <button
            type="button"
            onClick={() => setShowRegret(true)}
            style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.85rem', border: '1px solid var(--primary)', borderRadius: 8, background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
          >
            {lang === 'zh' ? '悔棋留档' : 'Archive Regret'}
          </button>
        )}
      </div>
      {showRegret && profileId && (
        <RegretModal lang={lang} profileId={profileId} date={dateStr} recordId={record.id} onClose={() => setShowRegret(false)} />
      )}
      {showDecisionReview && (
        <DecisionReviewModal date={dateStr} profileId={profileId ?? 'demo'} lang={lang} onClose={() => setShowDecisionReview(false)} />
      )}
    </div>
  )
}
