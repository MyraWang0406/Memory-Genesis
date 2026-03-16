import type { ActionPlan } from '../data/memoryEvents'

export function ActionPlanPanel({ plan }: { plan: ActionPlan }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(34,197,94,0.1)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>⚡ 中断旧路径的策略</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{plan.triggerContext}</span>
      </div>

      <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 10 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.65 }}>
          💡 <strong>核心思路</strong>：长期规划不只是想象未来，而是在关键时刻识别旧模式并中断它。<br />
          下次遇到相似情境时，用这套策略替代自动化反应。
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '1rem', borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>✅ 新反应步骤</div>
          <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {plan.steps.map((s, i) => (
              <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>{s}</li>
            ))}
          </ol>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>🚫 旧路径特征（警惕）</div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {plan.avoidList.map((s, i) => (
              <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '1rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>❓ 中断触发问题</div>
          {plan.firstQuestions.map((q, i) => (
            <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55, padding: '0.35rem 0.5rem', background: 'rgba(59,130,246,0.06)', borderRadius: 6, marginBottom: '0.35rem' }}>"{q}"</div>
          ))}
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>🚦 停止信号</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.6 }}>{plan.signalToStop}</div>
        </div>
      </div>

      <div style={{ marginTop: '0.85rem', background: 'var(--card-bg)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '1rem', borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>🎭 情境专项策略</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {plan.roleSpecificTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', flexShrink: 0, minWidth: 140, marginTop: 1 }}>{tip.roleType}</span>
              <span style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>{tip.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
