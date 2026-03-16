import { useEffect, useState } from 'react'
import type { Lang } from '../i18n'
import { getText } from '../i18n'
import type { BoardInterpretation } from '../utils/boardState'
import { interpretBoard } from '../utils/boardState'

interface Props {
  scores: number[]
  moves: number
  edits: number
  lang: Lang
  whatIfContext?: string
  onWhatIfContextChange?: (v: string) => void
}

export function GoBoard({ scores, moves, edits, lang, whatIfContext = '', onWhatIfContextChange }: Props) {
  const T = getText(lang)
  const [interp, setInterp] = useState<BoardInterpretation | null>(null)
  const [animating, setAnimating] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [boardTooltipVisible, setBoardTooltipVisible] = useState(false)
  const [boardTooltipPos, setBoardTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setInterp(interpretBoard(scores, moves, edits))
  }, [scores, moves, edits])

  useEffect(() => {
    if (moves + edits > 0) {
      setAnimating(true)
      const t = setTimeout(() => setAnimating(false), 600)
      return () => clearTimeout(t)
    }
  }, [moves, edits])

  if (!interp) return null

  const situationLabels = {
    safe: T.situationSafe,
    danger: T.situationDanger,
    balance: T.situationBalance,
  }
  const survivalLabels = {
    hasRetreat: T.survivalHasWay,
    noRetreat: T.survivalNoWay,
    alone: T.survivalAlone,
    together: T.survivalTogether,
  }
  const actionLabels = {
    defend: T.actionDefend,
    attack: T.actionAttack,
    rest: T.actionRest,
    repair: T.actionRepair,
  }

  const stoneCount = Math.max(6, Math.min((moves + edits) * 2, 36))
  const boardSize = 9
  const cellSize = 28

  return (
    <section
      className="go-board"
      style={{
        background: 'var(--board-bg)',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid var(--board-line)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--text)',
          }}
        >
          {T.boardTitle}
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {T.boardTitleNote}
        </span>
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '1px solid var(--text-muted)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              cursor: 'help',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setTooltipPos({ x: rect.left, y: rect.bottom + 6 })
              setTooltipVisible(true)
            }}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            ?
          </span>
          {tooltipVisible && (
            <div
              role="tooltip"
              style={{
                position: 'fixed',
                left: tooltipPos.x,
                top: tooltipPos.y,
                zIndex: 1000,
                maxWidth: 320,
                padding: '0.75rem 1rem',
                background: 'var(--card-bg)',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                fontSize: '0.8rem',
                color: 'var(--text)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                pointerEvents: 'none',
              }}
            >
              {T.boardRulesTooltip}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div
          style={{
            position: 'relative',
            background: 'var(--board-bg)',
            padding: 8,
            borderRadius: 4,
            border: `2px solid var(--board-line)`,
            cursor: 'help',
          }}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setBoardTooltipPos({ x: rect.left, y: rect.bottom + 6 })
            setBoardTooltipVisible(true)
          }}
          onMouseLeave={() => setBoardTooltipVisible(false)}
        >
          {boardTooltipVisible && (
            <div
              role="tooltip"
              style={{
                position: 'fixed',
                left: boardTooltipPos.x,
                top: boardTooltipPos.y,
                zIndex: 1000,
                maxWidth: 320,
                padding: '0.75rem 1rem',
                background: 'var(--card-bg)',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                fontSize: '0.8rem',
                color: 'var(--text)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                pointerEvents: 'none',
              }}
            >
              {T.boardHoverUser}
              {'\n\n'}
              {T.boardHoverSituation}: {situationLabels[interp.situation]}
              {'\n'}
              {T.survival}: {survivalLabels[interp.survival]}
              {'\n'}
              {T.boardHoverAdvice}: {actionLabels[interp.action]}
            </div>
          )}
          <svg
            width={boardSize * cellSize + 16}
            height={boardSize * cellSize + 16}
            viewBox={`0 0 ${boardSize * cellSize + 16} ${boardSize * cellSize + 16}`}
          >
            {Array.from({ length: boardSize }).map((_, i) => (
              <g key={i}>
                <line
                  x1={8 + cellSize / 2}
                  y1={8 + (i + 0.5) * cellSize}
                  x2={8 + (boardSize - 0.5) * cellSize}
                  y2={8 + (i + 0.5) * cellSize}
                  stroke="var(--board-line)"
                  strokeWidth={1}
                />
                <line
                  x1={8 + (i + 0.5) * cellSize}
                  y1={8 + cellSize / 2}
                  x2={8 + (i + 0.5) * cellSize}
                  y2={8 + (boardSize - 0.5) * cellSize}
                  stroke="var(--board-line)"
                  strokeWidth={1}
                />
              </g>
            ))}
            {Array.from({ length: stoneCount }).map((_, i) => {
              const row = Math.floor(i / boardSize)
              const col = i % boardSize
              const isBlack = i % 2 === 0
              const cx = 8 + (col + 0.5) * cellSize
              const cy = 8 + (row + 0.5) * cellSize
              return (
                <g key={i}>
                  {animating && i >= stoneCount - 2 && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={cellSize / 2 + 4}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      opacity={0.6}
                      className="stone-pulse"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={cellSize / 2 - 2}
                    fill={isBlack ? 'var(--stone-black)' : 'var(--stone-white)'}
                    stroke={isBlack ? '#374151' : '#e5e7eb'}
                    strokeWidth={1}
                  />
                </g>
              )
            })}
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              {T.situation}
            </span>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color:
                  interp.situation === 'safe'
                    ? 'var(--k-up)'
                    : interp.situation === 'danger'
                      ? 'var(--k-down)'
                      : 'var(--primary)',
              }}
            >
              {situationLabels[interp.situation]}
            </span>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              {T.survival}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
              {survivalLabels[interp.survival]}
            </span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              {T.actionAdvice}
            </span>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--primary-dark)',
              }}
            >
              {actionLabels[interp.action]}
            </span>
          </div>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {T.boardCore}
          </p>
          {(onWhatIfContextChange !== undefined) && (
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text)' }}>
                {T.whatIfContextLabel}
              </label>
              <textarea
                value={whatIfContext}
                onChange={(e) => onWhatIfContextChange(e.target.value)}
                placeholder={T.whatIfSimulateHint}
                rows={3}
                style={{
                  width: '100%',
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '0.5rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onWhatIfContextChange('')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {T.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    border: 'none',
                    borderRadius: 8,
                    background: 'var(--primary)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {T.simulateButton}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
