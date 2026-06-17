import SocialIcon from './SocialIcon.jsx'

// Список контактных ссылок с брендовыми иконками. Используется в футерах
// дашборда, лендинга и юридических страниц, чтобы не дублировать разметку.
const ICON_STYLE = { marginRight: 8, verticalAlign: '-4px' }

export default function ContactLinks({ emailLabel = 'Email' }) {
  return (
    <>
      <li><a href="https://t.me/SokolovNYU" target="_blank" rel="noreferrer"><SocialIcon name="telegram" style={ICON_STYLE} /> Telegram</a></li>
      <li><a href="https://vk.ru/sokolovnyu" target="_blank" rel="noreferrer"><SocialIcon name="vk" style={ICON_STYLE} /> ВКонтакте</a></li>
      <li><a href="https://youtube.com/@SokolovNYU" target="_blank" rel="noreferrer"><SocialIcon name="youtube" style={ICON_STYLE} /> YouTube</a></li>
      <li><a href="https://rutube.ru/channel/SokolovNYU" target="_blank" rel="noreferrer"><SocialIcon name="rutube" style={ICON_STYLE} /> Rutube</a></li>
      <li><a href="mailto:SokolovNYu@mail.ru"><SocialIcon name="email" style={ICON_STYLE} /> {emailLabel}</a></li>
    </>
  )
}
