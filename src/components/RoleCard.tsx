import type { RoleProfile } from '../data/memoryEvents'

const RISK_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const RISK_LABELS = { low: '低风险偏好', medium: '中等风险', high: '高风险偏好' }
const TYPE_LABELS = { self: '我', counterpart: '对方', 'third-party': '第三方' }
const TYPE_COLORS = { self: '#3b82f6', counterpart: '#8b5cf6', 'third-party': '#f59e0b' }

export function RoleCard({ role }: { role: RoleProfile }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: '1rem 1.1rem',
      minWidth: 200,
      flex: '1 1 200px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{
          padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
          background: `${TYPE_COLORS[role.type]}18`, color: TYPE_COLORS[role.type],
        }}>{TYPE_LABELS[role.type]}</span>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{role.name}</span>
      </div>
      {[
        { label: '目标', value: role.goal },
        { label: '约束', value: role.constraints },
        { label: '典型行为', value: role.typicalBehavior },
        { label: '对结果的影响', value: role.impactOnOutcome },
      ].map(({ label, value }) => (
        <div key={label} style={{ marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          <div style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5, marginTop: '0.1rem' }}>{value}</div>
        </div>
      ))}
      <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', borderRadius: 6, background: `${RISK_COLORS[role.riskPreference]}12`, border: `1px solid ${RISK_COLORS[role.riskPreference]}40` }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: RISK_COLORS[role.riskPreference], display: 'inline-block' }} />
        <span style={{ fontSize: '0.7rem', color: RISK_COLORS[role.riskPreference], fontWeight: 600 }}>{RISK_LABELS[role.riskPreference]}</span>
      </div>
    </div>
  )
}
