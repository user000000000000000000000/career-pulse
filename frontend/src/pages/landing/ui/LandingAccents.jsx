/** Edge-only vector decoration, separate from the raster illustration. */
export default function LandingAccents({ placement }) {
  return <div className={'landing-accents landing-accents--' + placement} aria-hidden="true">
    <svg className="landing-accents__star" viewBox="0 0 32 32" fill="currentColor" focusable="false"><path d="M16 1c2 10 5 13 15 15-10 2-13 5-15 15C14 21 11 18 1 16 11 14 14 11 16 1Z" /></svg>
    <svg className="landing-accents__trail" viewBox="0 0 100 150" fill="none" focusable="false"><path d="M18 12C95 25 8 65 58 92S87 120 57 138" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" /><circle cx="18" cy="12" r="3" fill="currentColor" /><circle cx="57" cy="138" r="5" stroke="currentColor" /></svg>
    <span className="landing-accents__glow" />
    <span className="landing-accents__diamond" />
  </div>
}
