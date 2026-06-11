import Header from './Header.jsx'
import Footer from './Footer.jsx'

/** Обёртка страницы: шапка + контент + подвал (любую часть можно отключить). */
export default function Layout({ children, header = true, footer = true, backTo = '/', backLabel = '← Назад' }) {
  return (
    <>
      {header && <Header backTo={backTo} backLabel={backLabel} />}
      {children}
      {footer && <Footer />}
    </>
  )
}
