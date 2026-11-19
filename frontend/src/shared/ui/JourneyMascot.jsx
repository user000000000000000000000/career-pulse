import { useId } from 'react'
import BirdFlight from './BirdFlight.jsx'
import './bird-helper.css'
import './journey-mascot.css'

// One original pose per scene. Every animated part is a rigid image layer.
const SCENES = [
  { name: 'welcome', frame: 1, part: 'M0 145H104L145 210L188 248L165 338H0Z', pivot: [169, 262], angle: 5, seconds: 2.8 },
  { name: 'explorer', frame: 0, part: 'M105 222H213L226 286L215 355H105Z', pivot: [191, 327], angle: 1.7, seconds: 4.4 },
  { name: 'heart', frame: 0, part: 'M172 267Q195 248 222 270Q253 248 281 270L282 311L231 352L176 316Z', pivot: [229, 310], angle: 1.5, seconds: 3.6 },
  { name: 'mirror', frame: 1, part: 'M0 0H296V460H0Z', pivot: [178, 389], angle: 1.1, seconds: 5.2 },
  { name: 'think-write', frame: 2, part: 'M105 229L150 194L168 198L194 245L221 310L210 324H114L104 284Z', pivot: [151, 284], angle: 2, seconds: 2.4 },
  { name: 'workshop', frame: 1, part: 'M0 60H137V143L124 181L137 226L166 267L151 310H0Z', pivot: [151, 265], angle: 1.8, seconds: 3.6 },
  { name: 'confidence', frame: 1, part: 'M54 175H150L165 238L171 300L164 348H109L108 262H54Z', pivot: [153, 287], angle: 3.2, seconds: 3.2 },
  { name: 'flight' },
  { name: 'conversation', frame: 2, part: 'M0 45H146L163 127L177 177L219 208L198 267L150 309H0Z', pivot: [196, 235], angle: 4.5, seconds: 3.1 },
  { name: 'letter', frame: 2, part: 'M100 232L170 205L187 211L210 270L229 313L215 320L114 312L101 284Z', pivot: [151, 279], angle: 2, seconds: 2.8 },
]

// Secondary layers never overlap the moving wing/hand layer.
const DETAILS = [
  { path: 'M340 72H390V178H340Z', pivot: [354, 93], angle: 2.2, kind: 'tassel' },
  { path: 'M366 330L450 321V400H369L346 365Z', pivot: [366, 355], angle: 1.8, kind: 'tail' },
  { path: 'M350 289H455V385L360 397L337 362Z', pivot: [356, 347], angle: 2, kind: 'tail' },
  { path: 'M301 0H480V458H301Z', pivot: [397, 418], angle: .7, kind: 'mirror' },
  null,
  { path: 'M333 287H409V350H346L319 329Z', pivot: [338, 323], angle: 1.6, kind: 'tail' },
  { path: 'M352 299H435V375L366 383L339 346Z', pivot: [355, 335], angle: 1.8, kind: 'tail' },
  null,
  { path: 'M414 181Q480 174 480 217V244L405 271L414 242Q392 210 414 181Z', pivot: [441, 223], angle: 2.8, kind: 'speech' },
  { path: 'M324 315H427V349H324Z', pivot: [374, 334], angle: 1.2, kind: 'envelope' },
]

function SceneAccents({ scene }) {
  return <svg className={`diagnostic-mascot__accents diagnostic-mascot__accents--${scene}`} viewBox="0 0 480 480" aria-hidden="true" focusable="false">
    <g className="diagnostic-mascot__spark diagnostic-mascot__spark--one"><path d="m416 62 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" /></g>
    <g className="diagnostic-mascot__spark diagnostic-mascot__spark--two"><path d="m56 115 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" /></g>
    {scene === 'think-write' && <g className="diagnostic-mascot__idea"><circle cx="70" cy="200" r="3" /><circle cx="61" cy="183" r="5" /><path d="M39 152a13 13 0 1 1 22 9l-3 6H45l-2-6a13 13 0 0 1-4-9Zm7 21h11m-9 5h7" /></g>}
    {scene === 'flight' && <g className="diagnostic-mascot__breeze"><path d="M53 310H20m54 20H30m44 20H47" /></g>}
    {scene === 'mirror' && <g className="diagnostic-mascot__glint"><path d="m400 94 4 14 14 4-14 4-4 14-4-14-14-4 14-4Z" /></g>}
    {scene === 'conversation' && <g className="diagnostic-mascot__reply"><circle cx="48" cy="320" r="3" /><circle cx="64" cy="320" r="3" /><circle cx="80" cy="320" r="3" /></g>}
    {scene === 'letter' && <g className="diagnostic-mascot__ink"><path d="M159 335h54m-54 8h40" /></g>}
  </svg>
}

const VARIANT_POSES = { self: 4, future: 5, values: 3, path: 2, search: 2, letter: 10, sent: 10 }

function JourneyProps({ variant }) {
  return <svg className={`journey-mascot__props journey-mascot__props--${variant}`} viewBox="0 0 480 480" aria-hidden="true" focusable="false">
    {variant === 'future' && <g className="journey-mascot__cloud">
      <path d="M280 94c-24-19-8-50 15-49 5-30 50-35 66-10 30-13 57 4 55 28 32 7 32 45 3 52H302c-12 0-20-9-22-21Z" fill="#fff" />
      <circle cx="274" cy="129" r="8" fill="#fff" /><circle cx="262" cy="151" r="4" fill="#fff" />
      <path d="M313 89V61h20v28m8 0V48h23v41m8 0V68h21v21M304 91h98" />
      <path d="m375 36 4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1Z" fill="#d7eaff" />
    </g>}
    {(variant === 'path' || variant === 'search') && <g className="journey-mascot__map">
      <path d="m294 293 51-14 47 14 52-15v112l-52 15-47-14-51 14Z" fill="#fff" />
      <path d="M345 280v110m47-97v111" opacity=".25" />
      <path d="M309 377c57-9 5-46 51-46s16 38 66-22" strokeDasharray="5 7" />
      <circle cx="309" cy="377" r="5" fill="#87bfff" /><path d="m420 304 11 11m0-11-11 11" />
      {variant === 'search' && <g><circle cx="402" cy="324" r="25" fill="#e6f3ffb3" strokeWidth="7" /><path d="m421 344 26 29" strokeWidth="10" /></g>}
    </g>}
    {variant === 'sent' && <g className="journey-mascot__envelope">
      <rect x="280" y="305" width="144" height="94" rx="12" fill="#fff" />
      <path d="m284 312 68 49 68-49m-135 81 49-44m85 44-49-44" />
      <circle cx="416" cy="308" r="21" fill="#d8eaff" /><path d="m406 307 7 7 12-15" />
    </g>}
  </svg>
}

/** Existing character assets only. `still` is used for lightweight progress thumbnails. */
export default function JourneyMascot({ num = 1, variant, still = false }) {
  const id = `diagnostic-mascot-${useId().replace(/:/g, '')}`
  const pose = VARIANT_POSES[variant] || num
  const scene = SCENES[pose - 1] || SCENES[0]
  const detail = DETAILS[pose - 1]
  const source = `${import.meta.env.BASE_URL}diagnostic-mascots/block-${String(pose).padStart(2, '0')}.webp`
  const x = (scene.frame || 0) % 2 * 480, y = Math.floor((scene.frame || 0) / 2) * 480
  return <span className={`diagnostic-mascot diagnostic-mascot--${scene.name}${still ? ' diagnostic-mascot--still' : ''}`} data-scene={variant || scene.name} aria-hidden="true"
    style={{ '--scene-angle': `${scene.angle || 5}deg`, '--scene-speed': `${scene.seconds || 2}s`, '--scene-pivot': scene.pivot ? `${scene.pivot[0]}px ${scene.pivot[1]}px` : undefined,
      '--detail-angle': `${detail?.angle || 1}deg`, '--detail-pivot': detail ? `${detail.pivot[0]}px ${detail.pivot[1]}px` : undefined }}>
    {still ? <svg className="diagnostic-mascot__scene" viewBox={`${x} ${y} 480 480`} focusable="false"><image href={source} width="960" height="960" /></svg> : scene.name === 'flight' ? <BirdFlight greeting={1} /> :
      <svg className="diagnostic-mascot__scene" viewBox="0 0 480 480" aria-hidden="true" focusable="false" overflow="visible">
        <defs>
          <g id={`${id}-pose`}><svg width="480" height="480" viewBox={`${x} ${y} 480 480`} overflow="hidden"><image href={source} width="960" height="960" /></svg></g>
          <clipPath id={`${id}-part`}><path d={scene.part} /></clipPath>
          <mask id={`${id}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="480"><rect width="480" height="480" fill="white" /><path d={scene.part} fill="black" />{detail && <path d={detail.path} fill="black" />}</mask>
          {detail && <clipPath id={`${id}-detail`}><path d={detail.path} /></clipPath>}
          <clipPath id={`${id}-joint`}><circle cx={scene.pivot[0]} cy={scene.pivot[1]} r={scene.name === 'mirror' ? 0 : 15} /></clipPath>
        </defs>
        <g className="diagnostic-mascot__living">
          <use href={`#${id}-pose`} mask={`url(#${id}-base)`} />
          <g className="diagnostic-mascot__part"><use href={`#${id}-pose`} clipPath={`url(#${id}-part)`} /></g>
          {detail && <g className={`diagnostic-mascot__detail diagnostic-mascot__detail--${detail.kind}`}><use href={`#${id}-pose`} clipPath={`url(#${id}-detail)`} /></g>}
          <use href={`#${id}-pose`} clipPath={`url(#${id}-joint)`} />
        </g>
      </svg>}
    {!still && <SceneAccents scene={scene.name} />}
    {variant && <JourneyProps variant={variant} />}
  </span>
}
