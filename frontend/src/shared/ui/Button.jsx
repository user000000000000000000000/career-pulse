import './ui.css'

/** Кнопка. variant: primary | ghost | violet. as="a" для ссылки. */
export default function Button({
  children, variant = 'primary', block = false, as = 'button', className = '', ...rest
}) {
  const cls = [
    'cp-btn', `cp-btn--${variant}`, block && 'cp-btn--block', className
  ].filter(Boolean).join(' ')
  const Tag = as
  return <Tag className={cls} {...rest}>{children}</Tag>
}
