import Icon from '../../../shared/ui/Icon.jsx'

export default function MaterialsDecor({ placement }) {
  return <div className={'materials-decor materials-decor--' + placement} aria-hidden="true">
    <Icon name="sparkles" className="materials-decor__symbol materials-decor__star" size={22} />
    <Icon name="graduation" className="materials-decor__symbol materials-decor__cap" size={26} />
    <svg className="materials-decor__symbol materials-decor__plane" width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="m3 13 26-9-9 25-5-10-12-6Z M15 19 29 4 M15 19l-1 8 6-5" /></svg>
    <svg className="materials-decor__arc" width="72" height="112" viewBox="0 0 72 112" fill="none" focusable="false"><path d="M6 10C80 9 10 65 44 75S70 98 45 105" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" /><circle cx="6" cy="10" r="3" fill="currentColor" /></svg>
    <span className="materials-decor__ring" />
  </div>
}
