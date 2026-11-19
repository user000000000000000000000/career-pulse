import { applyDevProfile } from '../../pages/dashboard'
import { analyzeDiagnostic } from '../../pages/diagnostic'
import { CP } from '../../shared/api'
import { config } from '../../shared/config'
import { STORAGE_KEYS } from '../../shared/lib/storageKeys'

export async function prepareDemo(force = false) {
  if (!config.demoMode || (!force && localStorage.getItem('demo_initialized_v1'))) return
  await applyDevProfile('designer')
  await CP.saveUser({ name: 'Соколова Анна', email: 'anna@example.test', role: 'student', testDone: true })
  const stored = await CP.getProfile()
  const profile = { ...stored, context: { ...stored.context, name: 'Соколова Анна' } }
  await CP.updateProfile({ context: profile.context, ai_report: await analyzeDiagnostic(profile) })
  localStorage.setItem(STORAGE_KEYS.tourSeen, '1')
  localStorage.setItem('demo_initialized_v1', '1')
}
