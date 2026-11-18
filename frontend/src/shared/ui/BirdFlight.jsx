import { useId } from 'react'

// One alpha cutout of the existing flying character, split along its wing roots.
// The face, body and hat are never stretched or morphed; only the wings rotate.
const LEFT_WING = 'M0 400H285V610C305 665 389 715 480 704C485 760 516 837 577 913L620 960H0Z'
const LEFT_OUTER = 'M0 400H285V610C305 665 389 715 480 704C460 760 490 837 550 913L540 960H0Z'
const RIGHT_WING = 'M735 650C796 627 849 585 902 524L1000 380V0H1448V800H954C875 789 800 735 735 650Z'
const RIGHT_OUTER = 'M808 632C845 602 876 562 902 524L1000 380V0H1448V800H980C914 773 860 716 808 632Z'

export default function BirdFlight({ greeting }) {
  const id = useId().replace(/:/g, '')
  const source = `${import.meta.env.BASE_URL}bird-helper-flying.webp`
  return <span className="bird-helper__flight" aria-hidden="true">
    <svg className="bird-helper__bird" viewBox="0 0 1448 1086" focusable="false" overflow="visible">
      <defs>
        <clipPath id={`${id}-left`}><path d={LEFT_WING} /></clipPath>
        <clipPath id={`${id}-right`}><path d={RIGHT_WING} /></clipPath>
        <clipPath id={`${id}-shoulder`}><ellipse cx="813" cy="638" rx="65" ry="48" /></clipPath>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1448" height="1086">
          <rect width="1448" height="1086" fill="white" />
          <path d={LEFT_OUTER} fill="black" />
          <path d={RIGHT_OUTER} fill="black" />
        </mask>
      </defs>
      <g key={`left-${greeting}`} className={'bird-helper__wing bird-helper__wing--left' + (greeting ? ' bird-helper__wing--greeting' : '')}>
        <image href={source} width="1448" height="1086" clipPath={`url(#${id}-left)`} />
      </g>
      <image className="bird-helper__body" href={source} width="1448" height="1086" mask={`url(#${id}-body)`} />
      <image href={source} width="1448" height="1086" clipPath={`url(#${id}-shoulder)`} />
      <g key={`right-${greeting}`} className={'bird-helper__wing bird-helper__wing--right' + (greeting ? ' bird-helper__wing--greeting' : '')}>
        <image href={source} width="1448" height="1086" clipPath={`url(#${id}-right)`} />
      </g>
    </svg>
  </span>
}
