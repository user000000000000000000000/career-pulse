import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Eager — точки входа (первый экран), грузятся сразу.
import { Landing } from '../pages/landing'
import { Login } from '../pages/login'

// Lazy — остальные страницы грузятся отдельными чанками только при заходе.
const Register      = lazy(() => import('../pages/register').then(m => ({ default: m.Register })))
const VkConsent     = lazy(() => import('../pages/vk-consent').then(m => ({ default: m.VkConsent })))
const ResetPassword = lazy(() => import('../pages/reset-password').then(m => ({ default: m.ResetPassword })))
const Dashboard     = lazy(() => import('../pages/dashboard').then(m => ({ default: m.Dashboard })))
const DiagnosticBlock = lazy(() => import('../pages/diagnostic').then(m => ({ default: m.DiagnosticBlock })))
const DiagResults   = lazy(() => import('../pages/diagnostic').then(m => ({ default: m.DiagResults })))
const Roadmap       = lazy(() => import('../pages/diagnostic').then(m => ({ default: m.Roadmap })))
const Result        = lazy(() => import('../pages/result').then(m => ({ default: m.Result })))
const Profile       = lazy(() => import('../pages/profile').then(m => ({ default: m.Profile })))
const Atlas         = lazy(() => import('../pages/atlas').then(m => ({ default: m.Atlas })))
const LegalHub  = lazy(() => import('../pages/legal').then(m => ({ default: m.LegalHub })))
const Privacy   = lazy(() => import('../pages/legal').then(m => ({ default: m.Privacy })))
const Terms     = lazy(() => import('../pages/legal').then(m => ({ default: m.Terms })))
const Consent   = lazy(() => import('../pages/legal').then(m => ({ default: m.Consent })))
const AdConsent = lazy(() => import('../pages/legal').then(m => ({ default: m.AdConsent })))
const Recomm    = lazy(() => import('../pages/legal').then(m => ({ default: m.Recomm })))

import RequireAuth from './layout/RequireAuth.jsx'
import VkAuthHandler from './VkAuthHandler.jsx'
import AuthRecoveryHandler from './AuthRecoveryHandler.jsx'
import AppNav from './AppNav.jsx'
import { DialogHost } from '../shared/ui/Dialog.jsx'

const PageLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--ghost)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 2,
  }}>ЗАГРУЗКА…</div>
)

export default function App() {
  return (
    <>
    <VkAuthHandler />
    <AuthRecoveryHandler />
    <AppNav />
    <DialogHost />
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vk-consent" element={<RequireAuth><VkConsent /></RequireAuth>} />
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
