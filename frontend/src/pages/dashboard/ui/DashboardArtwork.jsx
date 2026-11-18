import { useId } from 'react'

// Crop the supplied white canvas in the viewport; retain the original pixels.
export default function DashboardArtwork() {
  const id = useId().replace(/:/g, '')
  return <div className="dashboard-artwork">
    <svg className="dashboard-artwork__photo" viewBox="431 176 674 672" preserveAspectRatio="xMaxYMid meet" role="img" aria-label="Птица-маскот в студенческой шапке с книгой" focusable="false">
      <defs>
        <linearGradient id={`${id}-fade`} x1="431" y1="0" x2="671" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="white" stopOpacity="0" /><stop offset="1" stopColor="white" /></linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="431" y="176" width="674" height="672"><rect x="431" y="176" width="674" height="672" fill={`url(#${id}-fade)`} /></mask>
      </defs>
      <image href={`${import.meta.env.BASE_URL}dashboard-welcome-original.png`} width="1536" height="1024" mask={`url(#${id}-mask)`} />
    </svg>
  </div>
}
