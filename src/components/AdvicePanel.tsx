import type { Lang } from '../i18n'
import { getText } from '../i18n'

export interface AdviceContent {
  fa?: string
  shi?: string
  qing?: string
  ren?: string
}

interface Props {
  lang: Lang
  /** 法/事/情/人 四块内容；缺则只显示该块说明 */
  content?: AdviceContent
  /** 是否紧凑展示（如弹窗内） */
  compact?: boolean
}

export function AdvicePanel({ lang, content, compact }: Props) {
  const T = getText(lang)
  const blocks: { key: 'fa' | 'shi' | 'qing' | 'ren'; label: string; desc: string; text?: string }[] = [
    { key: 'fa', label: T.adviceFa, desc: T.adviceFaDesc, text: content?.fa },
    { key: 'shi', label: T.adviceShi, desc: T.adviceShiDesc, text: content?.shi },
    { key: 'qing', label: T.adviceQing, desc: T.adviceQingDesc, text: content?.qing },
    { key: 'ren', label: T.adviceRen, desc: T.adviceRenDesc, text: content?.ren },
  ]
  return (
    <div style={{ marginTop: compact ? '0.5rem' : '0.75rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
        {T.adviceTitle}（法 · 事 · 情 · 人）
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: compact ? '0.35rem' : '0.5rem',
          fontSize: compact ? '0.75rem' : '0.8rem',
        }}
      >
        {blocks.map((b) => (
          <div
            key={b.key}
            style={{
              padding: compact ? '0.4rem' : '0.5rem',
              background: 'var(--card-bg)',
              border: '1px solid rgba(74,144,226,0.25)',
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.2rem' }}>{b.label}</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.35 }}>
              {b.text ?? b.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
