import { useState } from 'react'
import type { MemoryEvent, RoleProfile, WhatIfBranch } from '../data/memoryEvents'
import { genId } from '../utils/id'
import { RoleCard } from './RoleCard'
import { WhatIfSimulator } from './WhatIfSimulator'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad2(n: number) { return String(n).padStart(2, '0') }
function nowDt() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() }
}

interface DT { year: number; month: number; day: number; hour: number; minute: number }
function dtToISO(dt: DT) {
  return `${dt.year}-${pad2(dt.month)}-${pad2(dt.day)}T${pad2(dt.hour)}:${pad2(dt.minute)}`
}

// ─── Mock extraction ─────────────────────────────────────────────────────────
function mockAnalyze(memo: string, title: string): Omit<MemoryEvent, 'id' | 'date'> {
  const t = title || memo.slice(0, 20)
  const roles: RoleProfile[] = [
    { id: genId(), name: '我', type: 'self', goal: '达成本次沟通/事件的核心目标', constraints: '信息不完整，时间有限', riskPreference: 'medium', typicalBehavior: '主动推进，习惯先铺垫背景', impactOnOutcome: '直接决策方' },
    { id: genId(), name: '对方 / 关键角色', type: 'counterpart', goal: '（从备忘内容推断）实现自身优先级', constraints: '存在未明确的约束或压力', riskPreference: 'medium', typicalBehavior: '根据情境反应', impactOnOutcome: '影响事件走向的关键方' },
  ]
  const branches: WhatIfBranch[] = [
    { id: genId(), hypothesis: '如果我先确认对方的核心关注点', likelyCounterpartReaction: '对方会感到被理解，进入更开放的对话', chainedOutcome: '信息对齐更快，达成目标概率上升', finalImpact: 'positive' },
    { id: genId(), hypothesis: '如果我先给出结论再补充背景', likelyCounterpartReaction: '对方更容易抓住重点，减少误解', chainedOutcome: '沟通效率提升，节省双方时间', finalImpact: 'positive' },
    { id: genId(), hypothesis: '如果我等待更多信息再行动', likelyCounterpartReaction: '对方可能解读为犹豫或不积极', chainedOutcome: '可能错过时间窗口，但降低错误决策风险', finalImpact: 'neutral' },
    { id: genId(), hypothesis: '如果我重复以往的自动化反应', likelyCounterpartReaction: '触发相同的对方反应模式', chainedOutcome: '大概率重现历史结果，陷入路径依赖', finalImpact: 'neutral' },
  ]
  return {
    title: t,
    type: 'other',
    myGoal: '（从备忘内容自动提取：达成本次事件的核心目标）',
    constraints: '（自动识别：时间、信息、关系等约束）',
    actions: memo.slice(0, 120),
    result: '（待填写）',
    misjudgment: '',
    nextTimeWouldDo: '',
    tags: ['memo', 'auto-extracted'],
    moodScore: 5,
    roles,
    whatIfBranches: branches,
  }
}

// ─── DateTimePicker ───────────────────────────────────────────────────────────
function DTField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</label>
      <input type="number" value={value} min={min} max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, +e.target.value)))}
        style={{ width: 52, textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, padding: '0.3rem 0.2rem', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6, fontFamily: 'inherit' }} />
    </div>
  )
}

function DateTimeRangePicker({ start, end, onStartChange, onEndChange }: {
  start: DT; end: DT;
  onStartChange: (d: DT) => void;
  onEndChange: (d: DT) => void;
}) {
  const update = (dt: DT, field: keyof DT, v: number, cb: (d: DT) => void) => cb({ ...dt, [field]: v })
  const limits: Record<keyof DT, [number, number]> = { year: [2000, 2099], month: [1, 12], day: [1, 31], hour: [0, 23], minute: [0, 59] }
  const labels: Record<keyof DT, string> = { year: '年', month: '月', day: '日', hour: '时', minute: '分' }
  const fields: (keyof DT)[] = ['year', 'month', 'day', 'hour', 'minute']
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>开始时间</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {fields.map(f => <DTField key={f} label={labels[f]} value={start[f]} min={limits[f][0]} max={limits[f][1]} onChange={v => update(start, f, v, onStartChange)} />)}
        </div>
      </div>
      <div style={{ fontSize: '1rem', color: 'var(--text-muted)', paddingBottom: 8 }}>→</div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>结束时间</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {fields.map(f => <DTField key={f} label={labels[f]} value={end[f]} min={limits[f][0]} max={limits[f][1]} onChange={v => update(end, f, v, onEndChange)} />)}
        </div>
      </div>
    </div>
  )
}

// ─── EventWorkspace ──────────────────────────────────────────────────────────
interface Props {
  onSave?: (ev: MemoryEvent) => void
  onClose?: () => void
  inline?: boolean
}

export function EventWorkspace({ onSave, onClose, inline }: Props) {
  const n = nowDt()
  const [start, setStart] = useState<DT>(n)
  const [end, setEnd] = useState<DT>({ ...n, hour: n.hour + 1 })
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [eventType, setEventType] = useState<'memory' | 'whatif' | 'reflection'>('memory')
  const [isRecording, setIsRecording] = useState(false)
  const [analyzed, setAnalyzed] = useState<Omit<MemoryEvent,'id'|'date'> | null>(null)
  const [step, setStep] = useState<'input' | 'result'>('input')
  const [activeSection, setActiveSection] = useState<'extraction'|'roles'|'whatif'|'actions'>('extraction')

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('浏览器不支持语音输入')
      return
    }
    if (isRecording) {
      setIsRecording(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('')
      setMemo(prev => prev + (prev ? ' ' : '') + transcript)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    recognition.start()
    setIsRecording(true)
  }

  const handleAnalyze = () => {
    if (!memo.trim()) return
    const result = mockAnalyze(memo, title)
    setAnalyzed(result)
    setStep('result')
  }

  const handleSave = () => {
    if (!analyzed) return
    const ev: MemoryEvent = {
      ...analyzed,
      id: genId(),
      date: `${start.year}-${pad2(start.month)}-${pad2(start.day)}`,
      title: title || analyzed.title,
    }
    onSave?.(ev)
    setStep('input')
    setMemo('')
    setTitle('')
    setAnalyzed(null)
  }

  const containerStyle = inline ? {} : {
    position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 3000, padding: '1rem', overflowY: 'auto' as const,
  }
  const panelStyle = inline ? { width: '100%' } : {
    width: '100%', maxWidth: 700, background: 'var(--bg-page)',
    borderRadius: 18, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    marginTop: '1.5rem', marginBottom: '2rem',
  }

  return (
    <div style={containerStyle} onClick={inline ? undefined : (e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
            {step === 'input' ? '' : '📋 事件分析结果'}
          </h2>
          {onClose && <button type="button" onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.07)', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>}
        </div>

        {step === 'input' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* 事件类型选择 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>事件类型</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { id: 'memory' as const, label: '🧠 记忆记录', desc: '日常事件备忘' },
                  { id: 'whatif' as const, label: '🔀 决策推演', desc: '需要推演不同路径' },
                  { id: 'reflection' as const, label: '⚡ 复盘反思', desc: '已发生，需要复盘' },
                ].map(({ id, label, desc }) => (
                  <button key={id} type="button" onClick={() => setEventType(id)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.75rem',
                      border: eventType === id ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                      borderRadius: 10,
                      background: eventType === id ? 'rgba(59,130,246,0.06)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: eventType === id ? 'var(--primary)' : 'var(--text)', marginBottom: '0.15rem' }}>{label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 12, padding: '1rem' }}>
              <DateTimeRangePicker start={start} end={end} onStartChange={setStart} onEndChange={setEnd} />
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {dtToISO(start)} → {dtToISO(end)}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>事件标题（可选）</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="简短描述这个事件"
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.55rem 0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>事件备忘 *</label>
                <button type="button" onClick={handleVoiceInput}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isRecording ? '#ef4444' : 'white',
                    color: isRecording ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                  {isRecording ? '⏹ 停止录音' : '🎤 语音输入'}
                </button>
              </div>
              <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={6}
                placeholder={
                  eventType === 'memory' 
                    ? "今天和谁发生了什么事？\n这件事发生在什么场景下？\n涉及哪些角色、公司、关系？"
                    : eventType === 'whatif'
                    ? "描述当前面临的决策点：\n- 有哪些可选路径？\n- 涉及哪些角色和利益关系？\n- 你最担心什么？"
                    : "描述已发生的事件：\n- 你当时的选择是什么？\n- 现在后悔什么？\n- 如果重来会怎么做？"
                }
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.65rem 0.85rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontFamily: 'inherit', lineHeight: 1.65, resize: 'vertical', boxSizing: 'border-box', background: '#fafafa' }} />
            </div>
            
            {/* 决策推演类型的额外提示 */}
            {eventType === 'whatif' && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 10 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.65 }}>
                  💡 <strong>决策推演模式</strong>：系统会调取你的历史相似场景、涉及的角色生态位、矛盾点，并支持切换视角（自己/对方/第三方）进行推演。
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {onClose && <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>取消</button>}
              <button type="button" onClick={handleAnalyze} disabled={!memo.trim()}
                style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem', fontWeight: 700, border: 'none', borderRadius: 8, background: memo.trim() ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : '#e5e7eb', color: memo.trim() ? 'white' : 'var(--text-muted)', cursor: memo.trim() ? 'pointer' : 'default', boxShadow: memo.trim() ? '0 2px 12px rgba(99,102,241,0.3)' : 'none' }}>
                🔍 分析提取
              </button>
            </div>
          </div>
        )}

        {step === 'result' && analyzed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: 4 }}>{title || analyzed.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{dtToISO(start)} → {dtToISO(end)}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(['extraction','roles','whatif','actions'] as const).map(s => (
                <button key={s} type="button" onClick={() => setActiveSection(s)}
                  style={{ padding: '0.28rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: activeSection===s ? 'var(--primary)' : 'rgba(0,0,0,0.05)', color: activeSection===s ? 'white' : 'var(--text-muted)' }}>
                  {s==='extraction'?'📌 结构提取':s==='roles'?'🎭 角色建模':s==='whatif'?'🔀 推演':' ⚡ 行动建议'}
                </button>
              ))}
            </div>
            {activeSection === 'extraction' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[{l:'目标',v:analyzed.myGoal,c:'#3b82f6'},{l:'约束',v:analyzed.constraints,c:'#f59e0b'},{l:'行动',v:analyzed.actions,c:'#6366f1'},{l:'原始备忘',v:memo,c:'#22c55e'}].map(({l,v,c}) => (
                  <div key={l} style={{ borderLeft:`3px solid ${c}`, paddingLeft:'0.75rem' }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:c, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:'0.85rem', color:'var(--text)', lineHeight:1.55 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {activeSection === 'roles' && (
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {analyzed.roles.map(r => <RoleCard key={r.id} role={r} />)}
              </div>
            )}
            {activeSection === 'whatif' && (
              <WhatIfSimulator branches={analyzed.whatIfBranches} eventTitle={title || analyzed.title} />
            )}
            {activeSection === 'actions' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {[
                  {l:'先做',v:'先确认对方的核心关注点，再展开你的内容',c:'#22c55e'},
                  {l:'不要',v:'不要先铺垫大量背景，对方可能只想要结论',c:'#ef4444'},
                  {l:'还缺',v:'还需确认对方的优先级和约束条件',c:'#f59e0b'},
                  {l:'先问',v:'"你这次最关心的结果是什么？"',c:'#3b82f6'},
                ].map(({l,v,c}) => (
                  <div key={l} style={{ background:`${c}0d`, border:`1px solid ${c}30`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:'0.65rem 0.85rem' }}>
                    <span style={{ fontSize:'0.7rem', fontWeight:700, color:c, textTransform:'uppercase', marginRight:8 }}>{l}</span>
                    <span style={{ fontSize:'0.85rem', color:'var(--text)' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem', gap:'0.5rem', flexWrap:'wrap' }}>
              <button type="button" onClick={() => setStep('input')} style={{ padding:'0.45rem 0.9rem', fontSize:'0.85rem', border:'1px solid #e5e7eb', borderRadius:8, background:'transparent', cursor:'pointer', color:'var(--text-muted)' }}>← 返回修改</button>
              <button type="button" onClick={handleSave} style={{ padding:'0.5rem 1.4rem', fontSize:'0.9rem', fontWeight:700, border:'none', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', cursor:'pointer' }}>✓ 保存到记忆库</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

