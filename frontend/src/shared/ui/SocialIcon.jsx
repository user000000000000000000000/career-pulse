import Icon from './Icon.jsx'
// Brand glyphs use the same outline weight and blue as the interface icons.
export default function SocialIcon({ name, size = 16, style, className }) {
  if (!name || name === 'email') return <Icon name="mail" size={size} className={className} style={{ color: 'var(--brand-blue)', verticalAlign: 'middle', ...style }}/>
  const base = {
    width: size, height: size, viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { color: 'var(--brand-blue)', verticalAlign: 'middle', flexShrink: 0, ...style },
  }
  switch (name) {
    case 'telegram':
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="10.5" />
          <path d="m5.6 11.7 11.6-4.5-2 10.3-4.2-3.2-2 2 .3-3.2 5.6-4.2-7.4 3.7-1.9-.9Z" strokeWidth="1.2" />
        </svg>
      )
    case 'vk':
      return (
        <svg {...base}>
          <rect x="1.5" y="1.5" width="21" height="21" rx="5" />
          <path d="M12.9 16.4c-4.62 0-7.45-3.17-7.57-8.45h2.32c.08 3.87 1.8 5.5 3.16 5.84V7.95h2.18v3.34c1.34-.14 2.74-1.67 3.22-3.34h2.18c-.37 2.06-1.9 3.59-2.98 4.22 1.08.5 2.82 1.84 3.48 4.23h-2.4c-.52-1.6-1.8-2.85-3.5-3.02v3.02Z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...base}>
          <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" />
          <path d="M10 8.6 15.2 12 10 15.4Z" strokeWidth="1.4" />
        </svg>
      )
    case 'rutube':
      return (
        <svg {...base}>
          <rect x="1.5" y="1.5" width="21" height="21" rx="5" />
          <path d="M9.3 8.1 16 12l-6.7 3.9Z" strokeWidth="1.4" />
        </svg>
      )
    case 'email':
    default:
      return <Icon name="mail" size={size} className={className} style={style}/>
  }
}
