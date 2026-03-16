export function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2d4a 100%)',
      borderRadius: 20,
      padding: '3rem 2.5rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* grid bg decoration */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(74,144,226,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,226,0.07) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,144,226,0.15)', border: '1px solid rgba(74,144,226,0.4)', borderRadius: 20, padding: '0.3rem 0.85rem', marginBottom: '1.25rem' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4A90E2', display: 'inline-block', boxShadow: '0 0 6px #4A90E2' }} />
          <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>EverMemOS · Decision Memory Coach</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: 'white', margin: '0 0 0.75rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          把每次重要事件的误判<br />
          <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>变成下次的竞争优势</span>
        </h1>
        <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '2rem', maxWidth: 560, lineHeight: 1.7 }}>
          结构化记录每个关键事件 → 提取角色动机与约束 → 识别你的重复误判模式 → 在下次相似情境触发时，提前给出可执行的行动建议。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={onStart}
            style={{ padding: '0.7rem 1.6rem', fontSize: '0.95rem', fontWeight: 700, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
            开始记录事件 →
          </button>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>已内置求职 / 面试复盘 Demo 数据</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {[
            { num: '3', label: '历史事件已记录' },
            { num: '3', label: '识别的重复误判' },
            { num: '1', label: '即将进行的面试' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{num}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
