import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import type { Dimension } from '../types'
import type { Lang } from '../i18n'
import { getText } from '../i18n'

const localeMap = { zh: zhCN, en: enUS }

interface Props {
  dimension: Dimension
  onDimensionChange: (d: Dimension) => void
  lang: Lang
  onLangChange: (l: Lang) => void
  date: Date
  onDateChange?: (d: Date) => void
}

const KLINE_VIEWS = [
  { dim: 'week', label: '周', icon: '🗓️' },
  { dim: 'month', label: '月', icon: '🌙' },
  { dim: 'quarter', label: '季', icon: '📊' },
  { dim: 'year', label: '年', icon: '✨' },
  { dim: 'lifetime', label: '一生', icon: '♾️' },
]

export function Header({ dimension, onDimensionChange, lang, onLangChange, date, onDateChange }: Props) {
  const T = getText(lang)
  const dims: Dimension[] = ['about', 'profile', 'day', 'week', 'month', 'quarter', 'year', 'lifetime']
  const dimLabels: Record<Dimension, string> = {
    home: lang === 'zh' ? '首页' : 'Home',
    about: lang === 'zh' ? 'About Me' : 'About Me',
    profile: T.dimProfile,
    day: lang === 'zh' ? '日' : 'Day',
    week: lang === 'zh' ? '周' : 'Week',
    month: lang === 'zh' ? '月' : 'Month',
    quarter: lang === 'zh' ? '季' : 'Quarter',
    year: lang === 'zh' ? '年' : 'Year',
    lifetime: lang === 'zh' ? '一生' : 'Lifetime',
  }
  const dimIcons: Record<Dimension, string> = {
    home: '🏠',
    about: '',
    profile: '',
    day: '📅',
    week: '🗓️',
    month: '🌙',
    quarter: '📊',
    year: '✨',
    lifetime: '♾️',
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-page)',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <h1
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--primary-dark)',
          }}
        >
          {T.appTitle}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {dims.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDimensionChange(d)}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.9rem',
                border: 'none',
                borderRadius: 8,
                background: dimension === d ? 'var(--primary)' : 'transparent',
                color: dimension === d ? 'white' : 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {dimIcons[d] && <span>{dimIcons[d]}</span>}
              <span>{dimLabels[d]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onLangChange(lang === 'zh' ? 'en' : 'zh')}
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.8rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--text)',
              cursor: 'pointer',
              marginLeft: '0.5rem',
            }}
          >
            {lang === 'zh' ? T.langEn : T.langZh}
          </button>
        </div>
      </div>
      <div
        style={{
          maxWidth: 900,
          margin: '0.25rem auto 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {T.slogan} {T.sloganSub}
        </span>
        {(dimension === 'day' || dimension === 'week' || dimension === 'month' || dimension === 'quarter' || dimension === 'year') && onDateChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                if (dimension === 'day') onDateChange(subDays(date, 1))
                else if (dimension === 'week') onDateChange(subWeeks(date, 1))
                else if (dimension === 'month') onDateChange(subMonths(date, 1))
                else if (dimension === 'year') onDateChange(subYears(date, 1))
                else if (dimension === 'quarter') onDateChange(subMonths(date, 3))
              }}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              ←
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, minWidth: 100, textAlign: 'center' }}>
              {dimension === 'day' && format(date, 'yyyy-MM-dd', { locale: localeMap[lang] })}
              {dimension === 'week' && format(date, 'yyyy-MM-dd', { locale: localeMap[lang] })}
              {dimension === 'month' && format(date, 'yyyy-MM', { locale: localeMap[lang] })}
              {dimension === 'year' && format(date, 'yyyy', { locale: localeMap[lang] })}
              {dimension === 'quarter' && `${format(date, 'yyyy', { locale: localeMap[lang] })} Q${Math.floor(date.getMonth() / 3) + 1}`}
            </span>
            <button
              type="button"
              onClick={() => {
                if (dimension === 'day') onDateChange(addDays(date, 1))
                else if (dimension === 'week') onDateChange(addWeeks(date, 1))
                else if (dimension === 'month') onDateChange(addMonths(date, 1))
                else if (dimension === 'year') onDateChange(addYears(date, 1))
                else if (dimension === 'quarter') onDateChange(addMonths(date, 3))
              }}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
