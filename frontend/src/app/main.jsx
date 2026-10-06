import React from 'react'
import ReactDOM from 'react-dom/client'
// BrowserRouter — чистые URL (/login вместо /#/login). Токены из писем Supabase приходят
// в hash (implicit flow) и читаются supabase-js напрямую из window.location до роутера, VK
// шлёт ?code в query — роутеру это не мешает. Прямой заход на подпуть держит SPA-фолбэк в
// .htaccess (reg.ru). Откат — вернуть `HashRouter as BrowserRouter`.
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'
import '../shared/ui/print.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
