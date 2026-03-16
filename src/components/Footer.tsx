import type { Lang } from '../i18n'
import { getText } from '../i18n'

const EMAIL = 'MartixMirix@163.com'

export function Footer({ lang }: { lang: Lang }) {
  const T = getText(lang)
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        background: 'rgba(0,0,0,0.45)',
        color: 'rgba(255,255,255,0.92)',
        fontSize: '0.8rem',
        padding: '0.4rem 0.75rem',
        borderRadius: 8,
        zIndex: 50,
      }}
    >
      <a
        href={`mailto:${EMAIL}`}
        style={{ color: 'rgba(255,255,255,0.92)', textDecoration: 'none' }}
      >
        {T.contact}: {EMAIL}
      </a>
    </footer>
  )
}
