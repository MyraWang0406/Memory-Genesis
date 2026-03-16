import { useMemo } from 'react'

interface Props {
  dimension: 'week' | 'month' | 'quarter' | 'year' | 'lifetime'
  lang?: 'zh' | 'en'
}

const MESSAGES = {
  zh: '风水轮流转，运势有高低，祝你着眼未来，当下努力于成长进步，最想要的都拥有。\n通过复盘反思修正，让今后：愿力>业力>当下能力，而非沉湎内耗于过去；得不到的都释怀。',
  en: 'Unresolved patterns loop until you choose anew.\nUnhealed emotions escalate until you shift your attitude.',
}

export function LifeKlineChart({ dimension, lang = 'zh' }: Props) {
  const chartData = useMemo(() => {
    // 生成模拟的K线数据
    const generateKlineData = (count: number) => {
      const data = []
      let basePrice = 50
      for (let i = 0; i < count; i++) {
        const volatility = Math.random() * 20 - 10
        const open = basePrice + volatility
        const close = open + (Math.random() * 15 - 7.5)
        const high = Math.max(open, close) + Math.random() * 5
        const low = Math.min(open, close) - Math.random() * 5
        data.push({ open, close, high, low })
        basePrice = close
      }
      return data
    }

    const configs: Record<string, { count: number; label: string; unit: string }> = {
      week: { count: 7, label: '周', unit: '天' },
      month: { count: 30, label: '月', unit: '天' },
      quarter: { count: 90, label: '季度', unit: '天' },
      year: { count: 12, label: '年', unit: '月' },
      lifetime: { count: 100, label: '一生', unit: '年' },
    }

    const config = configs[dimension]
    return {
      data: generateKlineData(config.count),
      ...config,
    }
  }, [dimension])

  const width = 1000
  const height = 300
  const padding = { top: 30, right: 30, bottom: 40, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const allPrices = chartData.data.flatMap(d => [d.high, d.low])
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceRange = maxPrice - minPrice || 1

  const scaleX = chartWidth / (chartData.data.length - 1 || 1)
  const scaleY = chartHeight / priceRange

  const getY = (price: number) => padding.top + chartHeight - (price - minPrice) * scaleY

  const getXLabel = (index: number) => {
    if (dimension === 'year') {
      const labelsZh = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const labelsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const months = lang === 'zh' ? labelsZh : labelsEn
      return months[index] ?? String(index + 1)
    }
    // 周 / 月 / 季度 / 一生：统一用数字，周 & 季度本身就是天数
    return String(index + 1)
  }

  return (
    <div style={{ marginBottom: '2rem', background: 'var(--card-bg)', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.5rem' }}>
        📈 Life K-line
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {MESSAGES[lang]}
      </p>
      <svg width="100%" height={300} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(59,130,246,0.02)', borderRadius: 8 }}>
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio)
          const price = minPrice + priceRange * ratio
          return (
            <g key={`grid-${i}`}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} fontSize="12" fill="var(--text-muted)" textAnchor="end">
                {Math.round(price)}
              </text>
            </g>
          )
        })}

        {/* 上升/下降的连续折线：按相邻收盘价判断涨跌 */}
        {chartData.data.map((candle, i) => {
          if (i === 0) return null
          const prev = chartData.data[i - 1]
          const x = padding.left + i * scaleX
          const yClose = getY(candle.close)
          const isUp = candle.close >= prev.close
          const color = isUp ? '#22c55e' : '#ef4444'

          return (
            <g key={`point-${i}`}>
              {/* 当前点与前一收盘价的连线 */}
              <line
                x1={padding.left + (i - 1) * scaleX}
                y1={getY(prev.close)}
                x2={x}
                y2={yClose}
                stroke={color}
                strokeWidth="2.5"
                opacity="0.9"
              />
              {/* 点 */}
              <circle cx={x} cy={yClose} r="3.2" fill={color} opacity="0.95" />
            </g>
          )
        })}

        {/* X轴标签 */}
        {[0, Math.floor(chartData.data.length / 4), Math.floor(chartData.data.length / 2), Math.floor((chartData.data.length * 3) / 4), chartData.data.length - 1].map((i, idx) => {
          if (i >= chartData.data.length) return null
          const x = padding.left + i * scaleX
          return (
            <text key={`label-${idx}`} x={x} y={height - 10} fontSize="12" fill="var(--text-muted)" textAnchor="middle">
              {getXLabel(i)}
            </text>
          )
        })}

        {/* 轴线 */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="var(--text-muted)" strokeWidth="1" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="var(--text-muted)" strokeWidth="1" />
      </svg>
    </div>
  )
}
