import { useState } from 'react'
import type { Lang } from '../i18n'
import { EventWorkspace } from './EventWorkspace'
import { SimilarityRecallPanel } from './SimilarityRecallPanel'
import type { MemoryEvent } from '../types'
import { getEvents } from '../services/eventStore'

interface Props {
  lang: Lang
}

export function AboutView({ lang }: Props) {
  const isZh = lang === 'zh'
  const [expandedSection, setExpandedSection] = useState<'recall' | 'understand' | null>(null)
  const events = getEvents()
  const handleEventSave = (ev: MemoryEvent) => {}
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2d4a 100%)', borderRadius: 20, padding: '2.5rem 2rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(74,144,226,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,226,0.07) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: '0 0 0.3rem', lineHeight: 1.2 }}>{isZh ? '你的释怀树洞 & 优势教练' : 'Life Coach & Decision Revise Agent Teams'}</h2>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#60a5fa', margin: '0 0 1rem', lineHeight: 1.3 }}>{isZh ? '人生复盘 · 决策推演 · 未来规划 智能体系统' : 'A Multi-Agent System for Personal Growth & Reflection'}</h1>
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0, lineHeight: 1.75, maxWidth: 600 }}>{isZh ? '未释怀的情绪会淤积郁结，拉低能量；未解决的问题会重复出现，直到你给出新的答案。' : <>Unresolved patterns loop until you choose anew.<br />Unhealed emotions escalate until you shift your attitude.</>}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(59,130,246,0.2)', borderLeft: '4px solid #3b82f6', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }} onClick={() => setExpandedSection(expandedSection === 'recall' ? null : 'recall')}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>⏮️</div>
            <div><h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{isZh ? 'Before | 回看过去' : 'Before | Trace Back'}</h2><p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isZh ? '回到当时：发生了什么，这类事以前出现过吗' : 'Go back: What happened, has this occurred before?'}</p></div>
          </div>
          <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}><li>{isZh ? '记录关键事件、人物与情境' : 'Record key events, people & context'}</li><li>{isZh ? '调取相似历史与未释怀片段' : 'Recall similar history & unresolved moments'}</li></ul>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(139,92,246,0.2)', borderLeft: '4px solid #8b5cf6', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }} onClick={() => setExpandedSection(expandedSection === 'understand' ? null : 'understand')}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>🎭</div>
            <div><h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{isZh ? 'Now | 理解结构' : 'Now | Understand Structure'}</h2><p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isZh ? '看清当下：谁在影响这件事，他们各自怎么想' : 'Clarify now: Who influences this, what do they think?'}</p></div>
          </div>
          <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}><li>{isZh ? '识别生态位、角色关系与利益链' : 'Identify ecology, relationships & interests'}</li><li>{isZh ? '推演自己、对方与第三方的视角' : 'Simulate self, other & third-party views'}</li></ul>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(34,197,94,0.2)', borderLeft: '4px solid #22c55e', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>🎯</div>
            <div><h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{isZh ? 'After | 目标校准' : 'After | Goal Calibration'}</h2><p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isZh ? '面向以后：用户真正想要什么，未来如何优化' : 'Look ahead: What users truly want, how to optimize future?'}</p></div>
          </div>
          <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}><li>{isZh ? '区分表意、底层动机与真实目的' : 'Distinguish intent, driver & ultimate goal'}</li><li>{isZh ? '生成短期优化与长期改善建议' : 'Generate short-term optimizations & long-term improvements'}</li></ul>
        </div>
      </div>
      <div style={{ marginBottom: '2.5rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '1.5rem' }}><p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.8, fontWeight: 500 }}>{isZh ? '因果本相连，知行常断档：从过往遗憾中看见惯性路径依赖，拆解关键环节、补齐认知差，用当下行动校准未来结果。' : 'Uncover repeated patterns in past regrets, grasp former drivers behind choices, and align your future choices with your true goals.'}</p></div>
      <div style={{ marginBottom: '2.5rem' }}><h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>{isZh ? '🔄 工作流程' : '🔄 Workflow'}</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>{[{step:1,title:isZh?'输入事件':'Input Event',icon:'📝',desc:isZh?'记录发生了什么':'Record what happened'},{step:2,title:isZh?'回看过去':'Look Back',icon:'⏮️',desc:isZh?'召回相似经历':'Recall similar moments'},{step:3,title:isZh?'理解结构':'Understand',icon:'🎭',desc:isZh?'分析角色与动机':'Analyze roles & motives'},{step:4,title:isZh?'校准目标':'Calibrate',icon:'🎯',desc:isZh?'明确真正诉求':'Clarify true goals'},{step:5,title:isZh?'生成回应':'Respond',icon:'⚡',desc:isZh?'形成下一步动作':'Form next actions'}].map(({step,title,icon,desc})=>(<div key={step} style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'1.25rem 1rem',background:'var(--card-bg)',border:'1px solid #e5e7eb',borderRadius:12}}><div style={{width:50,height:50,borderRadius:'50%',background:'var(--primary)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',marginBottom:'0.75rem'}}>{icon}</div><h4 style={{margin:'0 0 0.5rem',fontSize:'0.9rem',fontWeight:700,color:'var(--text)'}}>{title}</h4><p style={{margin:0,fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.5}}>{desc}</p></div>))}</div></div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>{isZh ? '✍️ 记录事件' : '✍️ Record Event'}</h3>
        <div style={{ background: 'linear-gradient(135deg,#fef9ec,#fdf3d0)', border: '1px solid rgba(233,196,106,0.3)', borderRadius: 12, padding: '0.75rem 1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(233,196,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '1rem', color: '#92400e' }}>🌊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>人生棋局视角 · 宜流动</div>
            <div style={{ fontSize: '0.8rem', color: '#a16207', marginTop: 2 }}>情绪波动较大，适合进行自由书写与释怀。</div>
          </div>
        </div>
        <EventWorkspace inline onSave={handleEventSave} />
      </div>
      {expandedSection === 'recall' && (<div style={{ marginBottom: '2.5rem' }}><h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>{isZh ? '📖 回看过去' : '📖 Look Back'}</h3><SimilarityRecallPanel recalls={events.map(e=>({date:e.date,title:e.title,content:e.content}))} /></div>)}
      {expandedSection === 'understand' && (<div style={{ marginBottom: '2.5rem' }}><h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>{isZh ? '🎭 理解结构' : '🎭 Understand Structure'}</h3><div style={{padding:'1.5rem',background:'var(--card-bg)',border:'1px solid #e5e7eb',borderRadius:12,textAlign:'center',color:'var(--text-muted)'}}>{isZh ? '在首页记录事件后，角色分析将显示在这里。' : 'Role analysis will appear here after recording events on the homepage.'}</div></div>)}
    </div>
  )
}
