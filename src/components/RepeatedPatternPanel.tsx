import type { RecurringPattern } from '../data/memoryEvents'

export function RepeatedPatternPanel({ patterns }: { patterns: RecurringPattern[] }) {
  const severityConfig = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: '高频重复' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: '中频出现' },
    low: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: '偶尔触发' },
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(239,68,68,0.1)', display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: 6, marginBottom: '0.5rem' }}>🔁 重复的决策惯性</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          你后悔的不只是一次决策，而是在相似节点反复走回同一条旧路。<br />
          识别这些模式，理解它们的短期收益与长期代价，才能在下次中断惯性。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {patterns.map(p => {
          const cfg = severityConfig[p.severity]
          return (
            <div key={p.id} style={{
              background: cfg.bg,
              border: `1px solid ${cfg.color}30`,
              borderLeft: `4px solid ${cfg.color}`,
              borderRadius: 12,
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.4 }}>{p.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, background: `${cfg.color}15`, padding: '0.2rem 0.5rem', borderRadius: 5 }}>{cfg.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>出现 {p.occurrences} 次</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.65rem' }}>{p.description}</div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>短期收益</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>避免当下冲突 / 快速决策 / 维持舒适区</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>长期代价</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>错过关键信息 / 重复同类失误 / 路径依赖加深</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>中断方式</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>识别触发场景 → 暂停 2 分钟 → 问自己"这是旧路吗"</div>
                </div>
              </div>
              <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  影响事件：{p.affectedEvents.map((id, i) => (
                    <span key={id} style={{ marginLeft: 4, color: cfg.color, fontWeight: 600 }}>#{id.slice(-3)}{i < p.affectedEvents.length - 1 ? ',' : ''}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.65 }}>
          💡 <strong>关键洞察</strong>：有些特质应该保留，有些应该根据情境调整。<br />
          重点不是否定自我，而是理解旧模式何时劫持了自我。
        </div>
      </div>
    </div>
  )
}
