import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Produit dist/sw.js à partir de service-worker.js, avec la liste exacte des
// fichiers à garder hors ligne : ceux créés par la compilation (noms uniques
// comme assets/index-a1b2.js) et ceux du dossier public (icônes, sons…).
function serviceWorker() {
  let dossierPublic
  return {
    name: 'tantsaha-service-worker',
    apply: 'build',
    configResolved(config) {
      dossierPublic = config.publicDir
    },
    async generateBundle(options, bundle) {
      const publics = (await readdir(dossierPublic, { recursive: true, withFileTypes: true }))
        .filter((f) => f.isFile() && !f.name.endsWith('.md'))
        .map((f) => relative(dossierPublic, join(f.parentPath, f.name)).split(sep).join('/'))
      // index.html est ajouté par Vite après ce plugin : on l'inscrit nous-mêmes
      const fichiers = [...new Set(['index.html', ...Object.keys(bundle), ...publics])].map((f) => `/${f}`).sort()
      // la version change dès qu'un fichier change : le téléphone installe alors la nouvelle version
      const empreinte = createHash('sha256')
      for (const [nom, sortie] of Object.entries(bundle)) empreinte.update(nom + (sortie.code ?? sortie.source ?? ''))
      for (const f of publics) empreinte.update(f + (await readFile(join(dossierPublic, f))).length)

      const modele = await readFile(new URL('./service-worker.js', import.meta.url), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: modele
          .replace("const VERSION = '__VERSION__'", `const VERSION = ${JSON.stringify(empreinte.digest('hex').slice(0, 12))}`)
          .replace('const FICHIERS = __FICHIERS__', `const FICHIERS = ${JSON.stringify(fichiers)}`),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
  server: {
    // En développement, les appels à /api sont redirigés vers le serveur Node.js.
    // Le client écrit simplement fetch("/api/...") sans connaître le port de l'API.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  // npm run preview : même redirection, pour tester la version compilée
  preview: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test/preparation.js'],
  },
})
