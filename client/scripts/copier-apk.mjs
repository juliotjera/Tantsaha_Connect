// Après « npm run android:release » : copie l'APK et l'AAB signés dans android/sortie/,
// sous un nom stable (tantsaha-connect.apk), celui attendu par le lien de téléchargement du site.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'

const sortie = new URL('../android/sortie/', import.meta.url)
mkdirSync(sortie, { recursive: true })
const fichiers = [
  ['../android/app/build/outputs/apk/release/app-release.apk', 'tantsaha-connect.apk'],
  ['../android/app/build/outputs/bundle/release/app-release.aab', 'tantsaha-connect.aab'],
]
for (const [source, nom] of fichiers) {
  const depuis = new URL(source, import.meta.url)
  if (!existsSync(depuis)) {
    console.log(`✖ ${nom} : introuvable (signature.properties manquant ?)`)
    continue
  }
  copyFileSync(depuis, new URL(nom, sortie))
  console.log(`✔ ${nom} (${Math.round(statSync(depuis).size / 1024)} Ko) → android/sortie/`)
}
