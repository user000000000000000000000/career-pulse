import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Публичные страницы — в основном бандле (быстрый первый экран)
// LandingV2 — новый дизайн (Vic). Старая Landing.jsx оставлена в репо, но не подключена.
import Landing from './pages/LandingV2.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

// Остальное грузим по требованию (code-splitting)
const ResetPassword   = lazy(() => import('./pages/ResetPassword.jsx'))
const Dashboard       = lazy(() => import('./pages/Dashboard.jsx'))
const DiagnosticBlock = lazy(() => import('./pages/Diagnostic/DiagnosticBlock.jsx'))
const DiagResults     = lazy(() => import('./pages/Diagnostic/DiagResults.jsx'))
const Roadmap         = lazy(() => import('./pages/Diagnostic/Roadmap.jsx'))
const Result          = lazy(() => import('./pages/Result.jsx'))
const Profile         = lazy(() => import('./pages/Profile.jsx'))
const Atlas           = lazy(() => import('./pages/Atlas.jsx'))
const LegalHub        = lazy(() => import('./pages/Legal/LegalHub.jsx'))
const Privacy         = lazy(() => import('./pages/Legal/Privacy.jsx'))
const Terms           = lazy(() => import('./pages/Legal/Terms.jsx'))
const Consent         = lazy(() => import('./pages/Legal/Consent.jsx'))
const AdConsent       = lazy(() => import('./pages/Legal/AdConsent.jsx'))
const Recomm          = lazy(() => import('./pages/Legal/Recomm.jsx'))

import RequireAuth from './components/Layout/RequireAuth.jsx'
import VkAuthHandler from './components/VkAuthHandler.jsx'
import AuthRecoveryHandler from './components/AuthRecoveryHandler.jsx'
import AppNav from './components/AppNav.jsx'
import { DialogHost } from './components/Dialog.jsx'

function Loading() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#eef0fb', color: '#8c8cab', fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13, letterSpacing: 2,
    }}>ЗАГРУЗКА…</div>
  )
}

export default function App() {
  return (
    <>
    <VkAuthHandler />
    <AuthRecoveryHandler />
    <AppNav />
    <DialogHost />
    <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/test"        element={<Navigate to="/test/1" replace />} />
      <Route path="/test/:n"     element={<RequireAuth><DiagnosticBlock /></RequireAuth>} />
      <Route path="/diagnostic"  element={<RequireAuth><DiagResults /></RequireAuth>} />
      <Route path="/roadmap"     element={<RequireAuth><Roadmap /></RequireAuth>} />
      <Route path="/result"    element={<RequireAuth><Result /></RequireAuth>} />
      <Route path="/profile"   element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/atlas"     element={<RequireAuth><Atlas /></RequireAuth>} />

      <Route path="/legal"           element={<LegalHub />} />
      <Route path="/legal/privacy"   element={<Privacy />} />
      <Route path="/legal/terms"     element={<Terms />} />
      <Route path="/legal/consent"   element={<Consent />} />
      <Route path="/legal/adconsent" element={<AdConsent />} />
      <Route path="/legal/recomm"    element={<Recomm />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
    </>
  )
}
