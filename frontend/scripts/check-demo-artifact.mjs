import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

// Fails the employer-demo build before upload if it contains sensitive files,
// production integration settings, trackers or an incorrect deployment base.
// Reports paths and rule names only, never matched values.
const directory = path.resolve('dist-demo-vercel')
const files = fs.readdirSync(directory, { recursive: true }).filter(name => fs.statSync(path.join(directory, name)).isFile())
const problems = []
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['provider-secret', /(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}|sb_secret_[A-Za-z0-9_-]{15,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})/],
  ['production-backend', /https:\/\/supabase\.careerpulse\.ru/],
  ['production-tracker', /mc\.yandex\.(?:ru|com)|112717792/],
]

for (const name of files) {
  if (/(?:^|[\\/])(?:\.env(?:\..*)?|\.htaccess|sitemap\.xml|README\.txt|BIRD-HELPER-ASSET\.md|id_rsa|id_ed25519)$|\.(?:map|pem|key|sql|dump|csv)$/i.test(name)) problems.push({ file: name, rule: 'private-or-authoring-file' })
  if (!/\.(?:html|js|css|json|txt|svg)$/i.test(name)) continue
  const text = fs.readFileSync(path.join(directory, name), 'utf8')
  for (const [rule, pattern] of rules) if (pattern.test(text)) problems.push({ file: name, rule })
  for (const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || []) {
    try {
      const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
      if (claims.role || claims.email) problems.push({ file: name, rule: 'embedded-auth-token' })
    } catch { /* not a JWT */ }
  }
}

const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8')
assert.match(html, /name="robots" content="noindex, nofollow, noarchive"/)
assert.doesNotMatch(html, /\/career-pulse\//)
assert.match(html, /src="\/assets\//)
assert.equal(fs.readFileSync(path.join(directory, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n')
assert.deepEqual(problems, [], 'Demo artifact failed isolation audit (paths/rules only)')
console.log(`Employer demo: ${files.length} files checked; no embedded auth tokens, provider secrets, production backend/tracker settings or private/source-map files detected.`)
