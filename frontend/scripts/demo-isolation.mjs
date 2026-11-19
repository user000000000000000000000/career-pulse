import fs from 'node:fs'
import path from 'node:path'

// Registered only for Vite mode=demo. Production HTML and public files are untouched.
export function demoIsolation() {
  return {
    name: 'isolate-demo-from-production',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return {
          html: html
            .replace(/<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Yandex\.Metrika counter -->/g, '')
            .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<meta\b[^>]*(?:property=["']og:|name=["']twitter:)[^>]*>/gi, '')
            .replace(/<title>[\s\S]*?<\/title>/i, '<title>Пульс Карьеры — демоверсия редизайна</title>'),
          tags: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow, noarchive' }, injectTo: 'head' }],
        }
      },
    },
    writeBundle(options) {
      const directory = path.resolve(options.dir)
      fs.writeFileSync(path.join(directory, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
      // Vite copies public/ verbatim. Remove only generated copies of hosting and
      // authoring documents; retain all source assets and all website content.
      for (const filename of ['.htaccess', 'sitemap.xml', 'README.txt', 'BIRD-HELPER-ASSET.md']) {
        fs.rmSync(path.join(directory, filename), { force: true })
      }
    },
  }
}
