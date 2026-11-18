import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const frontend = fileURLToPath(new URL('../', import.meta.url))
const repository = path.resolve(frontend, '..')
const source = path.join(frontend, 'dist-demo-vercel')
const parent = path.join(repository, '.vercel')
const output = path.join(parent, 'output')
assert(fs.existsSync(path.join(source, 'index.html')), 'Audited demo build is required')
fs.mkdirSync(parent, { recursive: true })
// Never follow a redirected output directory when replacing generated files.
assert.equal(fs.realpathSync(parent).toLowerCase(), path.resolve(parent).toLowerCase())
if (fs.existsSync(output)) {
  assert(!fs.lstatSync(output).isSymbolicLink(), 'Refusing a symlink output directory')
  assert.equal(fs.realpathSync(output).toLowerCase(), path.resolve(output).toLowerCase())
  fs.rmSync(output, { recursive: true, force: true })
}
fs.mkdirSync(path.join(output, 'static'), { recursive: true })
fs.cpSync(source, path.join(output, 'static'), { recursive: true })
const config = JSON.parse(fs.readFileSync(path.join(frontend, 'vercel.json'), 'utf8'))
const headers = Object.fromEntries(config.headers[0].headers.map(header => [header.key, header.value]))
fs.writeFileSync(path.join(output, 'config.json'), JSON.stringify({ version: 3, routes: [
  { src: '/(.*)', headers, continue: true },
  { handle: 'filesystem' },
  { src: '/.*', dest: '/index.html' },
] }, null, 2))
console.log('Prepared audited demo in .vercel/output; only generated demo files were replaced.')
