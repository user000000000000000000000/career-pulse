// Брендовые SVG-иконки соцсетей/контактов (вместо эмодзи).
export default function SocialIcon({ name, size = 16, style, className }) {
  const base = {
    width: size, height: size, viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    style: { verticalAlign: 'middle', flexShrink: 0, ...style },
  }
  switch (name) {
    case 'telegram':
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="12" fill="#29A9EB" />
          <path d="M5.6 11.7 16.4 7.5c.5-.19.94.12.78.86l-1.84 8.7c-.13.6-.5.74-1.01.46l-2.77-2.04-1.33 1.28c-.15.15-.28.28-.56.28l.2-2.85 5.16-4.66c.22-.2-.05-.31-.35-.11l-6.38 4.02-2.75-.86c-.6-.19-.6-.6.13-.88Z" fill="#fff" />
        </svg>
      )
    case 'vk':
      return (
        <svg {...base}>
          <rect width="24" height="24" rx="6" fill="#0077FF" />
          <path d="M12.9 16.4c-4.62 0-7.45-3.17-7.57-8.45h2.32c.08 3.87 1.8 5.5 3.16 5.84V7.95h2.18v3.34c1.34-.14 2.74-1.67 3.22-3.34h2.18c-.37 2.06-1.9 3.59-2.98 4.22 1.08.5 2.82 1.84 3.48 4.23h-2.4c-.52-1.6-1.8-2.85-3.5-3.02v3.02Z" fill="#fff" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...base}>
          <rect y="5" width="24" height="14" rx="4.5" fill="#FF0000" />
          <path d="M10 8.6 15.2 12 10 15.4Z" fill="#fff" />
        </svg>
      )
    case 'rutube':
      return (
        <svg {...base}>
          <rect width="24" height="24" rx="6" fill="#F41240" />
          <path d="M9.3 8.1 16 12l-6.7 3.9Z" fill="#fff" />
        </svg>
      )
    case 'email':
    default:
      return (
        <svg {...base}>
          <rect x="2" y="4.5" width="20" height="15" rx="3" fill="#00E5C8" />
          <path d="m4.5 8 7.5 5 7.5-5" stroke="#08121A" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}
