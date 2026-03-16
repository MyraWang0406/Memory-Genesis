import { useState } from 'react'
import type { WhatIfBranch } from '../data/memoryEvents'

const IMPACT_CONFIG = {
  positive: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', label: '结果改善' },
  neutral: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: '影响有限' },
  negative: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: '结果更差' },
}

interface Props {
  branches: WhatIfBranch[]
  eventTitle: string
}

export function WhatIfSimulator({ branches, eventTitle }: Props) {
  const [active, setActive] = useState<string | null>(branches[0]?.id ?? null)
  const activeBranch = branches.find(b => b.id === active)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(99,102,241,0.1)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>🔀 路径推演</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{eventTitle}</span>
      </div>

      <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.65 }}>
          💡 如果当时选择不同的反应，对方会如何回应？结果会如何变化？<br />
          理解每条路径的短期与长期影响，为下次相似情境做准备。
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {branches.map((b, i) => {
          const cfg = IMPACT_CONFIG[b.finalImpact]
          return (
            <button key={b.id} type="button" onClick={() => setActive(b.id)}
              style={{
                flex: '1 1 160px', padding: '0.65rem 0.85rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `1px solid ${active === b.id ? cfg.color : '#e5e7eb'}`,
                background: active === b.id ? cfg.bg : 'var(--card-bg)',
                transition: 'all 0.15s',
              }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: cfg.color, marginBottom: '0.25rem' }}>分支 {i + 1} · {cfg.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.4 }}>{b.hypothesis}</div>
            </button>
          )
        })}
      </div>

      {activeBranch && (
        <div style={{
          background: IMPACT_CONFIG[activeBranch.finalImpact].bg,
          border: `1px solid ${IMPACT_CONFIG[activeBranch.finalImpact].color}40`,
          borderRadius: 12, padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>假设</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.55, fontWeight: 600 }}>{activeBranch.hypothesis}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>对方可能的反应</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.55 }}>{activeBranch.likelyCounterpartReaction}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>链式结果变化</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.55 }}>{activeBranch.chainedOutcome}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
