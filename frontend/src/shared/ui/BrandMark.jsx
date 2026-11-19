/** User-supplied artwork shared by navigation and footer. */
export default function BrandMark({ size = 38, className = '', variant = 'blue' }) {
  const white = variant === 'white'
  return <img className={'brand-mark' + (white ? ' brand-mark--white' : '') + ' ' + className} width={size} height={size}
    src={`${import.meta.env.BASE_URL}${white ? 'brand-logo-white.png' : 'brand-logo-blue.png'}`} alt="" aria-hidden="true" draggable={false} />
}
