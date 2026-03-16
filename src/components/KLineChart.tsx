import { format, parseISO } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import type { Lang } from '../i18n'
import { getText } from '../i18n'

export interface KPoint {
  date: string
  score: number | null
  label?: string
  memo?: string
}

interface Props {
  points: KPoint[]
  lang: Lang
  granularity: 'day' | 'week' | 'month' | 'year' | 'lifetime'
  height?: number
}

const localeMap = { zh: zhCN, en: enUS }

function getYAxisTicks(yMin: number, yMax: number, granularity: string): number[] {
  if (granularity === 'lifetime' || yMax - yMin > 20) {
    const step = 20
    const low = Math.floor(yMin / step) * step
    const high = Math.ceil(yMax / step) * step
    const ticks: number[] = []
    for (let v = low; v <= high; v += step) ticks.push(v)
    return ticks.length ? ticks : [0, 50, 100]
  }
  return [0, 2.5, 5, 7.5, 10]
}

export function KLineChart({ points, lang, granularity, height = 200 }: Props) {
  const locale = localeMap[lang]
  const T = getText(lang)
  const valid = points.filter((p) => p.score != null && !isNaN(p.score))
  const scores = valid.map((p) => p.score!)
  const min = scores.length ? Math.min(...scores, 0) : 0
  const max = scores.length ? Math.max(...scores, 10) : 10
  const range = max - min || 1
  const pad = range * 0.1
  const yMin = min - pad
  const yMax = max + pad
  const yRange = yMax - yMin

  const leftMargin = 52
  const perPoint = granularity === 'year' ? 60 : granularity === 'lifetime' ? 28 : 36
  const chartWidth = Math.max(400, points.length * perPoint)
  const totalWidth = leftMargin + chartWidth
  const stepX = valid.length > 1 ? chartWidth / (valid.length - 1) : 0

  const formatDate = (d: string) => {
    const parsed = parseISO(d)
    if (granularity === 'day') return format(parsed, 'HH:mm', { locale })
    if (granularity === 'week') return format(parsed, 'MM/dd', { locale })
    if (granularity === 'month') return format(parsed, 'dd', { locale })
    if (granularity === 'year') return format(parsed, 'MMM', { locale })
    return format(parsed, 'yyyy', { locale })
  }

  const getChartY = (s: number) => 20 + (1 - (s - yMin) / yRange) * (height - 40)
  const yAxisTicks = getYAxisTicks(yMin, yMax, granularity)
  const showYearEvery = granularity === 'lifetime' && points.length > 15 ? 10 : 1

  return (
    <section
      className="kline-chart"
      style={{
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {granularity === 'lifetime' && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          {T.scoreAxis} 0–100 · {T.yearAxis}
        </div>
      )}
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: '100%', height, display: 'block' }}
      >
        {yAxisTicks.map((v) => {
          if (v < yMin - 1 || v > yMax + 1) return null
          const y = getChartY(v)
          return (
            <g key={v}>
              <line
                x1={leftMargin}
                y1={y}
                x2={totalWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <text
                x={leftMargin - 6}
                y={y + 4}
                fontSize={10}
                fill="var(--text-muted)"
                textAnchor="end"
              >
                {v}
              </text>
            </g>
          )
        })}
        {valid.length >= 2 &&
          valid.slice(1).map((p, i) => {
            const prev = valid[i]
            const x1 = leftMargin + i * stepX
            const x2 = leftMargin + (i + 1) * stepX
            const y1 = getChartY(prev.score!)
            const y2 = getChartY(p.score!)
            const isUp = p.score! >= prev.score!
            return (
              <g key={p.date}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isUp ? 'var(--k-up)' : 'var(--k-down)'}
                  strokeWidth={granularity === 'lifetime' ? 3.5 : 2.5}
                  strokeLinecap="round"
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r={granularity === 'lifetime' ? 3 : 4}
                  fill={isUp ? 'var(--k-up)' : 'var(--k-down)'}
                />
              </g>
            )
          })}
        {points.map((p, i) => {
          if (granularity === 'lifetime' && (i % showYearEvery !== 0 && i !== points.length - 1)) return null
          const x = points.length > 1 ? leftMargin + (i / (points.length - 1)) * chartWidth : leftMargin
          return (
            <text
              key={`${p.date}-${i}`}
              x={x}
              y={height - 4}
              fontSize={10}
              fill="var(--text-muted)"
              textAnchor="middle"
            >
              {formatDate(p.date)}
            </text>
          )
        })}
      </svg>
      <div
        style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f3f4f6',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          whiteSpace: 'pre-line',
        }}
      >
        {T.footnote}
      </div>
    </section>
  )
}
