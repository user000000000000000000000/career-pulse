import { Routes, Route, Navigate } from 'react-router-dom'

import Landing from './pages/Landing.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Test from './pages/Test.jsx'
import Result from './pages/Result.jsx'
import Profile from './pages/Profile.jsx'
import Atlas from './pages/Atlas.jsx'

import LegalHub from './pages/Legal/LegalHub.jsx'
import Privacy from './pages/Legal/Privacy.jsx'
import Terms from './pages/Legal/Terms.jsx'
import Consent from './pages/Legal/Consent.jsx'
import AdConsent from './pages/Legal/AdConsent.jsx'
import Recomm from './pages/Legal/Recomm.jsx'

import RequireAuth from './components/Layout/RequireAuth.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/test"      element={<RequireAuth><Test /></RequireAuth>} />
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
  )
}
