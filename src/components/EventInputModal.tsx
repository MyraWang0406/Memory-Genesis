import { useState } from 'react'
import type { MemoryEvent, EventType, RoleProfile } from '../data/memoryEvents'
import { genId } from '../utils/id'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'interview', label: '面试' },
  { value: 'negotiation', label: '谈判' },
  { value: 'collaboration', label: '合作' },
  { value: 'project', label: '项目' },
  { value: 'other', label: '其他' },
]

function emptyRole(type: RoleProfile['type']): RoleProfile {
  return { id: genId(), name: '', type, goal: '', constraints: '', riskPreference: 'medium', typicalBehavior: '', impactOnOutcome: '' }
}

function FieldInput({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.28rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
            style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.65rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: '100%', fontSize: '0.88rem', padding: '0.5rem 0.65rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }} />
      }
    </div>
  )
}

interface Props {
  onSave: (ev: MemoryEvent) => void
  onClose: () => void
}

export function EventInputModal({ onSave, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('interview')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [myGoal, setMyGoal] = useState('')
  const [constraints, setConstraints] = useState('')
  const [actions, setActions] = useState('')
  const [result, setResult] = useState('')
  const [misjudgment, setMisjudgment] = useState('')
  const [nextTime, setNextTime] = useState('')
  const [roles, setRoles] = useState<RoleProfile[]>([emptyRole('self'), emptyRole('counterpart')])

  const updateRole = (id: string, patch: Partial<RoleProfile>) =>
    setRoles(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r))

  const handleSave = () => {
    const ev: MemoryEvent = {
      id: genId(), title: title || '未命名事件', type, date,
      myGoal, constraints, actions, result, misjudgment,
      nextTimeWouldDo: nextTime,
      roles: roles.filter(r => r.name),
      whatIfBranches: [], tags: [type],
    }
    onSave(ev)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 3000, padding: '1rem', overflowY: 'auto' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 640, background: 'var(--card-bg)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>录入新事件</h2>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.07)', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {EVENT_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setType(t.value)}
              style={{ padding: '0.3rem 0.75rem', borderRadius: 20, border: `1px solid ${type === t.value ? 'var(--primary)' : '#e5e7eb'}`, background: type === t.value ? 'rgba(74,144,226,0.1)' : 'transparent', color: type === t.value ? 'var(--primary-dark)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>{t.label}</button>
          ))}
        </div>

        <FieldInput label="事件标题" value={title} onChange={setTitle} placeholder="简短描述这个事件" />
        <FieldInput label="日期" value={date} onChange={setDate} />
        <FieldInput label="我的目标" value={myGoal} onChange={setMyGoal} placeholder="当时我想达成什么？" multiline />
        <FieldInput label="当时的约束" value={constraints} onChange={setConstraints} placeholder="时间、信息、资源等限制" multiline />
        <FieldInput label="我采取了什么动作" value={actions} onChange={setActions} placeholder="具体做了什么？" multiline />
        <FieldInput label="最终结果" value={result} onChange={setResult} placeholder="实际发生了什么？" multiline />
        <FieldInput label="我现在认为的误判点" value={misjudgment} onChange={setMisjudgment} placeholder="回看，哪里判断错了？" multiline />
        <FieldInput label="下次我会怎么做" value={nextTime} onChange={setNextTime} placeholder="可执行的改变是什么？" multiline />

        <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>角色建模</div>
          {roles.map(r => (
            <div key={r.id} style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, padding: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', minWidth: 40 }}>{r.type === 'self' ? '我' : r.type === 'counterpart' ? '对方' : '第三方'}</span>
                <input value={r.name} onChange={e => updateRole(r.id, { name: e.target.value })} placeholder="角色名称"
                  style={{ flex: 1, fontSize: '0.85rem', padding: '0.35rem 0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, fontFamily: 'inherit' }} />
              </div>
              <input value={r.goal} onChange={e => updateRole(r.id, { goal: e.target.value })} placeholder="目标"
                style={{ width: '100%', fontSize: '0.83rem', padding: '0.3rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.3rem' }} />
              <input value={r.constraints} onChange={e => updateRole(r.id, { constraints: e.target.value })} placeholder="约束"
                style={{ width: '100%', fontSize: '0.83rem', padding: '0.3rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="button" onClick={() => setRoles(rs => [...rs, emptyRole('third-party')])}
            style={{ fontSize: '0.8rem', border: '1px dashed #d1d5db', borderRadius: 8, padding: '0.3rem 0.75rem', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>+ 添加第三方角色</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button type="button" onClick={onClose}
            style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>取消</button>
          <button type="button" onClick={handleSave}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>保存事件</button>
        </div>
      </div>
    </div>
  )
}
