import { useState, useMemo } from 'react'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import { getEvents, addEvent as storeAddEvent } from '../services/eventStore'
import { EventWorkspace } from './EventWorkspace'
import { agentPipeline, AgentResult } from '../services/agentPipeline'

interface Props {
  lang: Lang
  profileId: string | null
  onDimensionChange: (d: any) => void
  onNeedProfile: () => void
}

const ALMANAC = [
  { icon: '🌱', label: '宜播种', desc: '适合开启长期计划，建立新的行为习惯。' },
  { icon: '🛡️', label: '宜防御', desc: '今日宜复盘旧账，识别潜在的风险模式。' },
  { icon: '⚡', label: '宜决断', desc: '直觉敏锐，适合处理积压已久的决策难题。' },
  { icon: '🌊', label: '宜流动', desc: '情绪波动较大，适合进行自由书写与释怀。' },
]

export function HomeView({ lang, profileId, onDimensionChange, onNeedProfile }: Props) {
  const T = getText(lang)
  const [events, setEvents] = useState(() => getEvents())
  const [pipelineResult, setPipelineResult] = useState<AgentResult | null>(null)
  const [isPipelineLoading, setIsPipelineLoading] = useState(false)

  const addEvent = (ev: any) => {
    const newEvents = [ev, ...events]
    setEvents(newEvents)
    storeAddEvent(ev)
    
    // 自动触发 3-Agent 流水线
    handleRunPipeline(ev.title + ': ' + ev.content)
  }

  const handleRunPipeline = async (text: string) => {
    setIsPipelineLoading(true)
    try {
      const result = await agentPipeline.run(text)
      setPipelineResult(result)
    } catch (err) {
      console.error('Pipeline failed:', err)
    } finally {
      setIsPipelineLoading(false)
    }
  }

  const todayTip = useMemo(() => ALMANAC[new Date().getDate() % ALMANAC.length], [])

  return (
    <div className="home-view">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: 20, padding: '2rem 1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2.1rem)', fontWeight: 800, color: 'white', margin: '0 0 0.6rem', lineHeight: 1.25 }}>
            识别决策背后的惯性路径依赖<br />
            <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>未解决的问题会重复出现，直到你给出新的答案</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', maxWidth: 480, lineHeight: 1.65 }}>
            基于场景进行角色推演，后悔 → 复盘 → 行动指南：记录关键事件 → 识别决策依据 → 复盘潜意识动机 → 权衡长短期收益 → 校准调优避免惯性重复
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={onNeedProfile} style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>👤 我的档案</button>
          </div>
        </div>
      </div>

      <EventWorkspace inline onSave={(ev) => { addEvent(ev) }} />
    </div>
  )
}
