import { useState, useRef, useCallback, useEffect } from 'react'
import { format } from 'date-fns'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import type {
  DecisionReview,
  DecisionCharacter,
  DecisionSceneInfo,
  DecisionFacts,
  DecisionBackground,
  DecisionInnerWorld,
  DecisionAIOutput,
} from '../types'
import { genId } from '../utils/id'
import { upsertDecisionReview, loadDecisionReviews, deleteDecisionReview } from '../store'
import { isEverMemOSEnabled, syncDecisionReview as everMemSync } from '../services/evermemos'
import {
  isDoubaoEnabled,
  chatWithDoubao,
  buildAnalysisMessages,
  serializeReviewContext,
} from '../services/doubao'
import { AdvicePanel } from './AdvicePanel'

// ─── time presets ────────────────────────────────────────────────────────────
type TimePreset = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear' | 'custom'

function timePresetToDate(preset: TimePreset): string {
  const now = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
  if (preset === 'today') return fmt(now)
  if (preset === 'yesterday') { const d = new Date(now); d.setDate(d.getDate() - 1); return fmt(d) }
  if (preset === 'thisWeek') { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return fmt(d) }
  if (preset === 'thisMonth') return `${format(now, 'yyyy-MM')}-01`
  if (preset === 'thisQuarter') {
    const qStart = Math.floor(now.getMonth() / 3) * 3
    return `${format(now, 'yyyy')}-${String(qStart + 1).padStart(2, '0')}-01`
  }
  if (preset === 'thisYear') return `${format(now, 'yyyy')}-01-01`
  return fmt(now)
}

// ─── step types ───────────────────────────────────────────────────────────────
type Step = 'scene' | 'chars' | 'facts' | 'bg' | 'inner' | 'chat' | 'result'
const STEPS: Step[] = ['scene', 'chars', 'facts', 'bg', 'inner', 'chat', 'result']

// ─── empty factories ──────────────────────────────────────────────────────────
const emptyScene = (): DecisionSceneInfo => ({ event: '', time: '', place: '', userEmotion: '' })
const emptyFacts = (): DecisionFacts => ({ whatHappened: '', turningPoint: '', userChoice: '', regretPoint: '' })
const emptyBg = (): DecisionBackground => ({ interestRelation: '', powerRelation: '', historicalIssues: '', hiddenRules: '' })
const emptyInner = (): DecisionInnerWorld => ({ fearOrRegret: '', desire: '', selfAttack: '', futureOptimize: '' })
const emptyChar = (): DecisionCharacter => ({ id: genId(), name: '', role: '', behavior: '', personality: '', stance: '', realDemand: '' })

// ─── voice hook ─────────────────────────────────────────────────────────────
function useVoice(onResult: (t: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'webkitSpeechRecognition' in window)
  const ref = useRef<unknown>(null)
  const start = useCallback(() => {
    if (!supported) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const R = (window as any).webkitSpeechRecognition
    const r = new R()
    r.lang = 'zh-CN'; r.continuous = false; r.interimResults = false
    r.onresult = (e: { results: { transcript: string }[][] }) => {
      const t = e.results[0]?.[0]?.transcript ?? ''
      if (t) onResult(t)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    ref.current = r; r.start(); setListening(true)
  }, [supported, onResult])
  const stop = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(ref.current as any)?.stop?.()
    setListening(false)
  }, [])
  return { listening, supported, start, stop }
}

// ─── ui primitives ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function TA({ value, onChange, placeholder, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ width: '100%', fontSize: '0.88rem', padding: '0.55rem 0.7rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', background: 'rgba(255,255,255,0.7)', lineHeight: 1.55, boxSizing: 'border-box' }}
    />
  )
}

function VoiceBtn({ onAppend, lang }: { onAppend: (t: string) => void; lang: Lang }) {
  const T = getText(lang)
  const { listening, supported, start, stop } = useVoice(onAppend)
  if (!supported) return null
  return (
    <button type="button" onClick={listening ? stop : start}
      style={{ padding: '0.28rem 0.55rem', fontSize: '0.75rem', border: `1px solid ${listening ? '#ef4444' : 'var(--primary)'}`, borderRadius: 6, background: listening ? 'rgba(239,68,68,0.08)' : 'transparent', color: listening ? '#ef4444' : 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
      <span>{listening ? '●' : '🎙'}</span>
      <span>{listening ? T.drVoiceStop : T.drVoice}</span>
    </button>
  )
}

function StepBar({ current, T }: { current: Step; T: ReturnType<typeof getText> }) {
  const labels: Record<Step, string> = {
    scene: T.drStepScene, chars: T.drStepChars, facts: T.drStepFacts,
    bg: T.drStepBg, inner: T.drStepInner, chat: '多轮补充', result: T.drStepResult,
  }
  const idx = STEPS.indexOf(current)
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{
          padding: '0.22rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
          background: i === idx ? 'var(--primary)' : i < idx ? 'rgba(74,144,226,0.18)' : 'rgba(0,0,0,0.05)',
          color: i === idx ? 'white' : i < idx ? 'var(--primary-dark)' : 'var(--text-muted)',
        }}>{labels[s]}</div>
      ))}
    </div>
  )
}

function AICard({ label, content, accent }: { label: string; content: string; accent: string }) {
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '0.9rem 1.1rem', borderLeft: `4px solid ${accent}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{content}</div>
    </div>
  )
}

// ─── main modal ──────────────────────────────────────────────────────────────
interface Props {
  date: string
  profileId: string
  lang: Lang
  onClose: () => void
}

export function DecisionReviewModal({ date, profileId, lang, onClose }: Props) {
  const T = getText(lang)
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<DecisionReview[]>(() => loadDecisionReviews(profileId))

  const [step, setStep] = useState<Step>('scene')
  const [title, setTitle] = useState('')
  const [timePreset, setTimePreset] = useState<TimePreset>('today')
  const [customDate, setCustomDate] = useState(date)
  const [endPreset, setEndPreset] = useState('sameDay')
  const [customEnd, setCustomEnd] = useState('')
  const [scene, setScene] = useState<DecisionSceneInfo>(emptyScene)
  const [chars, setChars] = useState<DecisionCharacter[]>([emptyChar()])
  const [facts, setFacts] = useState<DecisionFacts>(emptyFacts)
  const [bg, setBg] = useState<DecisionBackground>(emptyBg)
  const [inner, setInner] = useState<DecisionInnerWorld>(emptyInner)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [aiOutput, setAiOutput] = useState<DecisionAIOutput | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [needMore, setNeedMore] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatHistory])

  const refreshList = () => setReviews(loadDecisionReviews(profileId))

  function startNew() {
    setEditingId(null); setStep('scene'); setTitle('')
    setTimePreset('today'); setCustomDate(date); setEndPreset('sameDay'); setCustomEnd('')
    setScene(emptyScene()); setChars([emptyChar()]); setFacts(emptyFacts())
    setBg(emptyBg()); setInner(emptyInner())
    setChatHistory([]); setChatInput(''); setAiOutput(null); setNeedMore(false)
    setView('editor')
  }

  function openExisting(r: DecisionReview) {
    setEditingId(r.id); setStep(r.aiOutput ? 'result' : 'scene')
    setTitle(r.title); setTimePreset('custom'); setCustomDate(r.date)
    setEndPreset(r.endDate ? 'custom' : 'sameDay'); setCustomEnd(r.endDate ?? '')
    setScene(r.scene); setChars(r.characters.length ? r.characters : [emptyChar()])
    setFacts(r.facts); setBg(r.background); setInner(r.innerWorld)
    setChatHistory(r.chatHistory.map(m => ({ role: m.role, content: m.content })))
    setChatInput(''); setAiOutput(r.aiOutput ?? null); setNeedMore(false)
    setView('editor')
  }

  function buildReview(extra: Partial<DecisionReview> = {}): DecisionReview {
    const startDate = timePreset === 'custom' ? customDate : timePresetToDate(timePreset)
    const now = new Date().toISOString()
    return {
      id: editingId ?? genId(), profileId, date: startDate,
      endDate: endPreset === 'sameDay' ? undefined : endPreset === 'custom' ? customEnd || undefined : undefined,
      title: title || scene.event || '未命名复盘',
      scene, characters: chars.filter(c => c.name), facts, background: bg, innerWorld: inner,
      aiOutput: aiOutput ?? undefined,
      chatHistory: chatHistory.map((m, i) => ({ id: String(i), role: m.role, content: m.content, timestamp: now })),
      createdAt: now, updatedAt: now,
      ...extra,
    }
  }

  function saveDraft() {
    const r = buildReview(); upsertDecisionReview(r); refreshList(); setEditingId(r.id)
  }

  async function runAnalysis(force = false) {
    setAnalyzing(true); setNeedMore(false)
    try {
      const ctx = serializeReviewContext({ title, scene, characters: chars, facts, background: bg, innerWorld: inner })
      if (isDoubaoEnabled()) {
        const msgs = buildAnalysisMessages(ctx, chatHistory, force)
        const res = await chatWithDoubao(msgs, { maxTokens: 2500 })
        if (res.ok && res.content) {
          try {
            const cleaned = res.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
            const parsed = JSON.parse(cleaned)
            if (parsed.needMoreInfo && !force) {
              setNeedMore(true)
              const q = parsed.clarifyQuestion ?? T.drMultiTurnHint
              setChatHistory(h => [...h, { role: 'assistant', content: q }])
              setStep('chat')
            } else {
              const out: DecisionAIOutput = {
                rolePanorama: parsed.rolePanorama ?? '', boardAnalysis: parsed.boardAnalysis ?? '',
                optimalPath: parsed.optimalPath ?? '', futureGuide: parsed.futureGuide ?? '',
                bulletNote: parsed.bulletNote ?? '',
                adviceFa: parsed.adviceFa, adviceShi: parsed.adviceShi,
                adviceQing: parsed.adviceQing, adviceRen: parsed.adviceRen,
              }
              setAiOutput(out)
              const r = buildReview({ aiOutput: out })
              upsertDecisionReview(r); setEditingId(r.id)
              if (isEverMemOSEnabled()) {
                everMemSync(profileId, {
                  id: r.id, date: r.date, title: r.title,
                  sceneEvent: scene.event, userEmotion: scene.userEmotion,
                  whatHappened: facts.whatHappened, turningPoint: facts.turningPoint,
                  userChoice: facts.userChoice, regretPoint: facts.regretPoint,
                  fearOrRegret: inner.fearOrRegret, desire: inner.desire,
                  selfAttack: inner.selfAttack, futureOptimize: inner.futureOptimize,
                  aiSummary: out.bulletNote,
                }).catch(() => {})
              }
              refreshList(); setStep('result')
            }
          } catch {
            const out: DecisionAIOutput = { rolePanorama: '', boardAnalysis: '', optimalPath: '', futureGuide: '', bulletNote: res.content }
            setAiOutput(out); setStep('result')
          }
        }
      } else {
        const out: DecisionAIOutput = {
          rolePanorama: `事件：${scene.event}｜情绪：${scene.userEmotion}`,
          boardAnalysis: `${facts.whatHappened}\n转折：${facts.turningPoint}`,
          optimalPath: facts.userChoice || '（请配置豆包API获取AI分析）',
          futureGuide: inner.futureOptimize || '配置 VITE_DOUBAO_API_KEY 后可获取完整 AI 分析。',
          bulletNote: `• 后悔：${facts.regretPoint}\n• 害怕：${inner.fearOrRegret}\n• 渴望：${inner.desire}`,
        }
        setAiOutput(out); upsertDecisionReview(buildReview({ aiOutput: out })); refreshList(); setStep('result')
      }
    } finally { setAnalyzing(false) }
  }

  async function sendChat() {
    const msg = chatInput.trim(); if (!msg) return
    const newHist = [...chatHistory, { role: 'user' as const, content: msg }]
    setChatHistory(newHist); setChatInput('')
    await runAnalysisWithHistory(newHist)
  }

  async function runAnalysisWithHistory(hist: { role: 'user' | 'assistant'; content: string }[]) {
    setAnalyzing(true)
    try {
      const ctx = serializeReviewContext({ title, scene, characters: chars, facts, background: bg, innerWorld: inner })
      const msgs = buildAnalysisMessages(ctx, hist, false)
      const res = await chatWithDoubao(msgs, { maxTokens: 2500 })
      if (res.ok && res.content) {
        try {
          const cleaned = res.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleaned)
          if (parsed.needMoreInfo) {
            const q = parsed.clarifyQuestion ?? T.drMultiTurnHint
            setChatHistory(h => [...h, { role: 'assistant', content: q }])
          } else {
            const out: DecisionAIOutput = {
              rolePanorama: parsed.rolePanorama ?? '', boardAnalysis: parsed.boardAnalysis ?? '',
              optimalPath: parsed.optimalPath ?? '', futureGuide: parsed.futureGuide ?? '',
              bulletNote: parsed.bulletNote ?? '',
              adviceFa: parsed.adviceFa, adviceShi: parsed.adviceShi,
              adviceQing: parsed.adviceQing, adviceRen: parsed.adviceRen,
            }
            setAiOutput(out); upsertDecisionReview(buildReview({ aiOutput: out })); refreshList(); setStep('result')
          }
        } catch {
          setChatHistory(h => [...h, { role: 'assistant', content: res.content ?? '' }])
        }
      }
    } finally { setAnalyzing(false) }
  }

  // ─── render helpers ──────────────────────────────────────────────────────
  function renderScene() {
    const TIME_PRESETS: TimePreset[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'thisQuarter', 'thisYear', 'custom']
    const presetLabel: Record<TimePreset, string> = {
      today: T.drTimeToday, yesterday: T.drTimeYesterday, thisWeek: T.drTimeThisWeek,
      thisMonth: T.drTimeThisMonth, thisQuarter: T.drTimeThisQuarter, thisYear: T.drTimeThisYear, custom: T.drTimeCustom,
    }
    const END_PRESETS = ['sameDay', 'nextDay', 'nextMonth', 'nextQuarter', 'nextYear', 'custom']
    const endLabel: Record<string, string> = {
      sameDay: T.drEndSameDay, nextDay: T.drEndNextDay, nextMonth: T.drEndNextMonth,
      nextQuarter: T.drEndNextQuarter, nextYear: T.drEndNextYear, custom: T.drTimeCustom,
    }
    return (
      <div>
        <Field label={T.drTitleLabel}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={T.drTitlePlaceholder}
              style={{ flex: 1, fontSize: '0.88rem', padding: '0.55rem 0.7rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontFamily: 'inherit' }} />
            <VoiceBtn onAppend={t => setTitle(v => v + t)} lang={lang} />
          </div>
        </Field>
        <Field label={T.drSceneTime}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            {TIME_PRESETS.map(p => (
              <button key={p} type="button" onClick={() => setTimePreset(p)}
                style={{ padding: '0.22rem 0.6rem', fontSize: '0.75rem', borderRadius: 20, border: `1px solid ${timePreset === p ? 'var(--primary)' : '#e5e7eb'}`, background: timePreset === p ? 'rgba(74,144,226,0.12)' : 'transparent', color: timePreset === p ? 'var(--primary-dark)' : 'var(--text-muted)', cursor: 'pointer' }}>
                {presetLabel[p]}
              </button>
            ))}
          </div>
          {timePreset === 'custom' && <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} style={{ fontSize: '0.88rem', padding: '0.4rem 0.6rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8 }} />}
        </Field>
        <Field label={T.drEndDate}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            {END_PRESETS.map(p => (
              <button key={p} type="button" onClick={() => setEndPreset(p)}
                style={{ padding: '0.22rem 0.6rem', fontSize: '0.75rem', borderRadius: 20, border: `1px solid ${endPreset === p ? 'var(--primary)' : '#e5e7eb'}`, background: endPreset === p ? 'rgba(74,144,226,0.12)' : 'transparent', color: endPreset === p ? 'var(--primary-dark)' : 'var(--text-muted)', cursor: 'pointer' }}>
                {endLabel[p]}
              </button>
            ))}
          </div>
          {endPreset === 'custom' && <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ fontSize: '0.88rem', padding: '0.4rem 0.6rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8 }} />}
        </Field>
        <Field label={T.drSceneEvent}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <TA value={scene.event} onChange={v => setScene(s => ({ ...s, event: v }))} placeholder="发生了什么事？" rows={2} />
            <VoiceBtn onAppend={t => setScene(s => ({ ...s, event: s.event + t }))} lang={lang} />
          </div>
        </Field>
        <Field label={T.drScenePlace}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input value={scene.place} onChange={e => setScene(s => ({ ...s, place: e.target.value }))} placeholder="哪里？"
              style={{ flex: 1, fontSize: '0.88rem', padding: '0.55rem 0.7rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontFamily: 'inherit' }} />
            <VoiceBtn onAppend={t => setScene(s => ({ ...s, place: s.place + t }))} lang={lang} />
          </div>
        </Field>
        <Field label={T.drSceneEmotion}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input value={scene.userEmotion} onChange={e => setScene(s => ({ ...s, userEmotion: e.target.value }))} placeholder="愤怒、委屈、焦虑、无奈…"
              style={{ flex: 1, fontSize: '0.88rem', padding: '0.55rem 0.7rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontFamily: 'inherit' }} />
            <VoiceBtn onAppend={t => setScene(s => ({ ...s, userEmotion: s.userEmotion + t }))} lang={lang} />
          </div>
        </Field>
      </div>
    )
  }

  function renderChars() {
    return (
      <div>
        {chars.map((c, i) => (
          <div key={c.id} style={{ background: 'rgba(74,144,226,0.04)', border: '1px solid rgba(74,144,226,0.15)', borderRadius: 10, padding: '0.9rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>人物 {i + 1}</span>
              {chars.length > 1 && <button type="button" onClick={() => setChars(cs => cs.filter(x => x.id !== c.id))}
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', border: 'none', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>✕</button>}
            </div>
            {([
              ['name', T.drCharName, '名字/昵称/代号'],
              ['role', T.drCharRole, '主导者/执行者/受害者/推手…'],
              ['behavior', T.drCharBehavior, '他/她做了什么？'],
              ['personality', T.drCharPersonality, '强势/示弱/回避…'],
              ['stance', T.drCharStance, '表面立场与背后苦衷'],
              ['realDemand', T.drCharDemand, '真正想要什么？'],
            ] as [keyof DecisionCharacter, string, string][]).map(([key, label, ph]) => (
              <Field key={key} label={label}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input value={String(c[key])} onChange={e => setChars(cs => cs.map(x => x.id === c.id ? { ...x, [key]: e.target.value } : x))} placeholder={ph}
                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.45rem 0.6rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 7, fontFamily: 'inherit' }} />
                  <VoiceBtn onAppend={t => setChars(cs => cs.map(x => x.id === c.id ? { ...x, [key]: String(x[key]) + t } : x))} lang={lang} />
                </div>
              </Field>
            ))}
          </div>
        ))}
        <button type="button" onClick={() => setChars(cs => [...cs, emptyChar()])}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', border: '1px dashed var(--primary)', borderRadius: 8, background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
          {T.drCharAdd}
        </button>
      </div>
    )
  }

  function renderFacts() {
    const fields: [keyof DecisionFacts, string, string][] = [
      ['whatHappened', T.drFactsWhat, '完整描述事件经过…'],
      ['turningPoint', T.drFactsTurning, '哪一刻局势发生了转变？'],
      ['userChoice', T.drFactsChoice, '你当时做了什么选择？'],
      ['regretPoint', T.drFactsRegret, '最后悔哪个环节？'],
    ]
    return (
      <div>
        {fields.map(([k, label, ph]) => (
          <Field key={k} label={label}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <TA value={facts[k]} onChange={v => setFacts(f => ({ ...f, [k]: v }))} placeholder={ph} rows={2} />
              <VoiceBtn onAppend={t => setFacts(f => ({ ...f, [k]: f[k] + t }))} lang={lang} />
            </div>
          </Field>
        ))}
      </div>
    )
  }

  function renderBg() {
    const fields: [keyof DecisionBackground, string, string][] = [
      ['interestRelation', T.drBgInterest, '谁有什么利益？'],
      ['powerRelation', T.drBgPower, '谁的权力更大？'],
      ['historicalIssues', T.drBgHistory, '有哪些过往积怨？'],
      ['hiddenRules', T.drBgHidden, '这个场景有哪些不成文规定？'],
    ]
    return (
      <div>
        {fields.map(([k, label, ph]) => (
          <Field key={k} label={label}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <TA value={bg[k]} onChange={v => setBg(b => ({ ...b, [k]: v }))} placeholder={ph} rows={2} />
              <VoiceBtn onAppend={t => setBg(b => ({ ...b, [k]: b[k] + t }))} lang={lang} />
            </div>
          </Field>
        ))}
      </div>
    )
  }

  function renderInner() {
    const fields: [keyof DecisionInnerWorld, string, string][] = [
      ['fearOrRegret', T.drInnerFear, '最害怕什么？最后悔什么？'],
      ['desire', T.drInnerDesire, '内心深处真正渴望的是什么？'],
      ['selfAttack', T.drInnerAttack, '你如何责怪自己？'],
      ['futureOptimize', T.drInnerOptimize, '如果重来，你会怎么做不同的选择？'],
    ]
    return (
      <div>
        {fields.map(([k, label, ph]) => (
          <Field key={k} label={label}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <TA value={inner[k]} onChange={v => setInner(x => ({ ...x, [k]: v }))} placeholder={ph} rows={2} />
              <VoiceBtn onAppend={t => setInner(x => ({ ...x, [k]: x[k] + t }))} lang={lang} />
            </div>
          </Field>
        ))}
      </div>
    )
  }

  function renderChat() {
    return (
      <div>
        {needMore && (
          <div style={{ background: 'rgba(74,144,226,0.08)', border: '1px solid rgba(74,144,226,0.25)', borderRadius: 8, padding: '0.65rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--primary-dark)' }}>
            {T.drMultiTurnHint}
          </div>
        )}
        <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.25rem 0' }}>
          {chatHistory.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '0.55rem 0.85rem', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--card-bg)',
                color: m.role === 'user' ? 'white' : 'var(--text)',
                fontSize: '0.85rem', lineHeight: 1.55,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: m.role === 'assistant' ? '1px solid rgba(0,0,0,0.07)' : 'none',
              }}>{m.content}</div>
            </div>
          ))}
          {analyzing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '0.55rem 0.85rem', borderRadius: '12px 12px 12px 2px', background: 'var(--card-bg)', border: '1px solid rgba(0,0,0,0.07)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {T.drAnalyzing}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <textarea
            value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
            placeholder={T.drChatPlaceholder} rows={2}
            style={{ flex: 1, fontSize: '0.88rem', padding: '0.55rem 0.7rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, resize: 'none', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <VoiceBtn onAppend={t => setChatInput(v => v + t)} lang={lang} />
            <button type="button" onClick={sendChat} disabled={analyzing || !chatInput.trim()}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', border: 'none', borderRadius: 7, background: 'var(--primary)', color: 'white', cursor: 'pointer', opacity: analyzing || !chatInput.trim() ? 0.5 : 1 }}>
              {T.drSend}
            </button>
          </div>
        </div>
        {needMore && (
          <button type="button" onClick={() => runAnalysis(true)} disabled={analyzing}
            style={{ marginTop: '0.65rem', padding: '0.4rem 0.9rem', fontSize: '0.82rem', border: '1px solid var(--primary)', borderRadius: 8, background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
            {T.drConfirmAnalyze}
          </button>
        )}
      </div>
    )
  }

  function renderResult() {
    if (!aiOutput) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>暂无分析结果</div>
    return (
      <div>
        <AICard label={T.drResultRoles} content={aiOutput.rolePanorama} accent="#7c3aed" />
        <AICard label={T.drResultBoard} content={aiOutput.boardAnalysis} accent="#0891b2" />
        <AICard label={T.drResultOptimal} content={aiOutput.optimalPath} accent="#059669" />
        <AICard label={T.drResultFuture} content={aiOutput.futureGuide} accent="#d97706" />
        <AICard label={T.drResultBullet} content={aiOutput.bulletNote} accent="#db2777" />
        {(aiOutput.adviceFa || aiOutput.adviceShi || aiOutput.adviceQing || aiOutput.adviceRen) && (
          <AdvicePanel lang={lang} content={{ fa: aiOutput.adviceFa, shi: aiOutput.adviceShi, qing: aiOutput.adviceQing, ren: aiOutput.adviceRen }} />
        )}
      </div>
    )
  }

  // ─── list view ────────────────────────────────────────────────────────────
  function renderList() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>{T.drTitle}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{T.drSubtitle}</div>
          </div>
          <button type="button" onClick={startNew}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            {T.drNewBtn}
          </button>
        </div>
        {reviews.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{T.drListEmpty}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {reviews.map(r => (
              <div key={r.id}
                onClick={() => openExisting(r)}
                style={{ background: 'var(--card-bg)', borderRadius: 10, padding: '0.85rem 1rem', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.date}{r.endDate ? ` → ${r.endDate}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {r.aiOutput && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 6, background: 'rgba(5,150,105,0.1)', color: '#059669', fontWeight: 600 }}>AI✓</span>}
                    <button type="button"
                      onClick={e => { e.stopPropagation(); if (confirm('确认删除？')) { deleteDecisionReview(r.id); refreshList() } }}
                      style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem', border: 'none', borderRadius: 4, background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
                {r.scene.event && <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.scene.event.slice(0, 80)}{r.scene.event.length > 80 ? '…' : ''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── editor view ──────────────────────────────────────────────────────────
  function renderEditor() {
    const stepContent: Record<Step, React.ReactNode> = {
      scene: renderScene(),
      chars: renderChars(),
      facts: renderFacts(),
      bg: renderBg(),
      inner: renderInner(),
      chat: renderChat(),
      result: renderResult(),
    }
    const idx = STEPS.indexOf(step)
    const isLast = idx === STEPS.length - 1
    const canGoNext = idx < STEPS.length - 1

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <button type="button" onClick={() => setView('list')}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', border: '1px solid #e5e7eb', borderRadius: 6, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
            ← 列表
          </button>
          <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{title || T.drTitlePlaceholder}</span>
          <button type="button" onClick={saveDraft}
            style={{ padding: '0.28rem 0.65rem', fontSize: '0.78rem', border: '1px solid var(--primary)', borderRadius: 6, background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
            {T.drSave}
          </button>
        </div>
        <StepBar current={step} T={T} />
        <div style={{ minHeight: 200 }}>{stepContent[step]}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', gap: '0.5rem' }}>
          <button type="button" onClick={() => idx > 0 && setStep(STEPS[idx - 1])} disabled={idx === 0}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}>
            ← 上一步
          </button>
          {step !== 'result' && step !== 'inner' && canGoNext && (
            <button type="button" onClick={() => setStep(STEPS[idx + 1])}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
              下一步 →
            </button>
          )}
          {step === 'inner' && (
            <button type="button" onClick={() => runAnalysis(false)} disabled={analyzing}
              style={{ padding: '0.45rem 1.2rem', fontSize: '0.88rem', border: 'none', borderRadius: 8, background: analyzing ? '#9ca3af' : 'var(--primary)', color: 'white', cursor: analyzing ? 'wait' : 'pointer', fontWeight: 600 }}>
              {analyzing ? T.drAnalyzing : T.drAnalyze}
            </button>
          )}
          {step === 'chat' && !needMore && (
            <button type="button" onClick={() => runAnalysis(false)} disabled={analyzing}
              style={{ padding: '0.45rem 1.2rem', fontSize: '0.88rem', border: 'none', borderRadius: 8, background: analyzing ? '#9ca3af' : 'var(--primary)', color: 'white', cursor: analyzing ? 'wait' : 'pointer', fontWeight: 600 }}>
              {analyzing ? T.drAnalyzing : T.drAnalyze}
            </button>
          )}
          {step === 'result' && (
            <button type="button" onClick={() => runAnalysis(true)} disabled={analyzing}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', border: '1px solid var(--primary)', borderRadius: 8, background: 'transparent', color: 'var(--primary)', cursor: analyzing ? 'wait' : 'pointer' }}>
              {analyzing ? T.drAnalyzing : '重新分析'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── modal shell ──────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 2000, padding: '1rem', overflowY: 'auto' }}
      onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640, background: 'linear-gradient(135deg, #fefefe 0%, #f7f8fc 100%)',
          borderRadius: 16, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          marginTop: '2rem', marginBottom: '2rem', position: 'relative',
        }}
      >
        <button type="button" onClick={onClose} aria-label={T.drClose}
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, border: 'none', borderRadius: '50%', background: 'rgba(0,0,0,0.07)', color: 'var(--text)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ×
        </button>
        {view === 'list' ? renderList() : renderEditor()}
      </div>
    </div>
  )
}

