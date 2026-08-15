import { Routes, Route, Navigate } from 'react-router-dom'

import { Landing } from '../pages/landing'
import { Register } from '../pages/register'
import { VkConsent } from '../pages/vk-consent'
import { Login } from '../pages/login'
import { ResetPassword } from '../pages/reset-password'
import { Dashboard } from '../pages/dashboard'
import { DiagnosticBlock, DiagResults, Roadmap } from '../pages/diagnostic'
import { Result } from '../pages/result'
import { Profile } from '../pages/profile'
import { Atlas } from '../pages/atlas'

import { LegalHub, Privacy, Terms, Consent, AdConsent, Recomm } from '../pages/legal'

import RequireAuth from './layout/RequireAuth.jsx'
import VkAuthHandler from './VkAuthHandler.jsx'
import AuthRecoveryHandler from './AuthRecoveryHandler.jsx'
import AppNav from './AppNav.jsx'
import { DialogHost } from '../shared/ui/Dialog.jsx'

export default function App() {
  return (
    <>
    <VkAuthHandler />
    <AuthRecoveryHandler />
    <AppNav />
    <DialogHost />
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
    </>
  )
}
