// Tests de bout en bout de Tantsaha Connect : npm run test:e2e
// 1. démarre l'API (base en mémoire) qui sert l'application compilée (dist) ;
// 2. pilote Chrome sans interface comme le ferait un agriculteur ;
// 3. vérifie l'accessibilité de chaque écran (axe-core, WCAG 2.1 AA),
//    en malagasy, en français, en mode sombre et en mode plein soleil.
// La météo est simulée : résultats identiques à chaque lancement, sans internet.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { ouvrirNavigateur, pause } from './navigateur.mjs'

const PORT = 5099
const BASE = `http://localhost:${PORT}`
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

// --- météo simulée : forte pluie (60 mm) après-demain → alerte de danger ---
function meteoSimulee() {
  const jour = (i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const jours = [0, 1, 2, 3, 4, 5, 6]
  return {
    current: { temperature_2m: 21.4, weather_code: 2, wind_speed_10m: 9, is_day: 1 },
    daily: {
      time: jours.map(jour),
      weather_code: [2, 3, 65, 61, 3, 1, 0],
      temperature_2m_max: [26, 25, 22, 23, 26, 27, 28],
      temperature_2m_min: [14, 15, 16, 15, 13, 12, 12],
      precipitation_sum: [0, 2, 60, 12, 0, 0, 0],
      precipitation_probability_max: [10, 40, 95, 70, 20, 5, 0],
      wind_gusts_10m_max: [20, 25, 45, 30, 20, 18, 15],
    },
    // 24 heures à partir de 6 h : sec et calme jusqu'à 11 h (bon moment pour traiter), pluie l'après-midi
    hourly: (() => {
      const heures = Array.from({ length: 24 }, (_, i) => (6 + i) % 24)
      return {
        time: heures.map((h, i) => `${jour(6 + i >= 24 ? 1 : 0)}T${String(h).padStart(2, '0')}:00`),
        temperature_2m: heures.map((h) => (h >= 10 && h <= 16 ? 24 : 16)),
        weather_code: heures.map((h) => (h >= 13 && h <= 17 ? 61 : 2)),
        precipitation: heures.map((h) => (h >= 13 && h <= 17 ? 3 : 0)),
        precipitation_probability: heures.map((h) => (h >= 12 && h <= 17 ? 80 : 10)),
        wind_speed_10m: heures.map(() => 8),
        is_day: heures.map((h) => (h >= 6 && h <= 18 ? 1 : 0)),
      }
    })(),
  }
}

async function simulerMeteo(page) {
  await page.envoyer('Fetch.enable', { patterns: [{ urlPattern: '*api.open-meteo.com*' }] })
  page.ecouter((m) => {
    if (m.method !== 'Fetch.requestPaused') return
    page.envoyer('Fetch.fulfillRequest', {
      requestId: m.params.requestId,
      responseCode: 200,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
      ],
      body: Buffer.from(JSON.stringify(meteoSimulee())).toString('base64'),
    })
  })
}

async function auditer(page, nom) {
  await page.evaluer(`${AXE};0`)
  const violations = await page.evaluer(`axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
    .then((r) => r.violations.map((v) => v.id + ' (' + v.nodes.length + ') ' + v.nodes[0].target.join(' ')))`)
  assert.deepEqual(violations, [], `accessibilité : ${nom}`)
}

// --- petit lanceur de tests ---
const resultats = []
async function etape(nom, fn) {
  const debut = Date.now()
  try {
    await fn()
    resultats.push({ nom, ok: true })
    console.log(`  ✔ ${nom} (${Date.now() - debut} ms)`)
  } catch (erreur) {
    resultats.push({ nom, ok: false })
    console.log(`  ✖ ${nom}\n    ${erreur.message.split('\n').join('\n    ')}`)
  }
}

const serveur = spawn(process.execPath, ['src/index.js'], {
  cwd: fileURLToPath(new URL('../../server/', import.meta.url)),
  env: { ...process.env, PORT: String(PORT), DB_MODE: 'memoire', DOSSIER_CLIENT: fileURLToPath(new URL('../dist/', import.meta.url)) },
  stdio: 'ignore',
})
const page = await ouvrirNavigateur()
const api = async (chemin) => (await fetch(BASE + chemin)).json()

try {
  for (let i = 0; i < 40; i++) {
    if (await fetch(`${BASE}/api/sante`).then((r) => r.ok).catch(() => false)) break
    await pause(250)
  }
  await simulerMeteo(page)
  await page.taille(390, 844)

  console.log('\nParcours')
  await etape('premier lancement : langue puis lieu', async () => {
    await page.aller(BASE + '/')
    await page.attendre('document.querySelector(".premier")')
    await page.cliquer('Français')
    assert.equal(await page.evaluer('document.documentElement.lang'), 'fr')
    await page.attendre('document.querySelector(".premier .choix-lieu")')
    await page.cliquer('Antsirabe')
    await page.attendre('!document.querySelector(".premier")')
    // petit guide : les 4 rubriques, une par écran, jusqu'au bout
    await page.attendre('document.querySelector(".torolalana")')
    await auditer(page, 'petit guide (fr)')
    for (let i = 0; i < 3; i++) await page.cliquer('Suivant')
    await page.cliquer('Terminé')
    await page.attendre('!document.querySelector(".torolalana")')
    assert.equal(await page.texte('.bienvenue-salut'), 'Bonjour !')
    await page.attendre('document.querySelector(".bienvenue-temperature")')
    assert.equal(await page.texte('.bienvenue-temperature'), '21°')
  })

  await etape('alerte de danger calculée depuis la météo', async () => {
    await page.attendre('document.querySelector(".bandeau-danger")')
    assert.equal(await page.texte('.bandeau-texte strong'), 'Pluie très forte')
    await page.aller(BASE + '/alertes')
    assert.match(await page.texte('.alerte-danger .alerte-detail'), /60\smm/)
  })

  await etape('heure par heure : bon moment pour traiter', async () => {
    await page.aller(BASE + '/meteo')
    await page.attendre('document.querySelector(".traitement-plage")')
    // sec et calme de 6 h à 11 h (la pluie commence à 13 h, sa probabilité monte dès midi)
    assert.match(await page.texte('.traitement-plage'), /6 h – 11 h/)
    assert.match(await page.texte('.traitement .sr-only'), /de 6 h à 11 h/) // phrase lue par le lecteur d'écran
    assert.equal(await page.evaluer('document.querySelectorAll(".heure-traitement").length'), 5)
  })

  await etape('application installée hors ligne (service worker)', async () => {
    await page.evaluer('navigator.serviceWorker.ready.then(() => true)')
    await page.aller(BASE + '/')
    assert.equal(await page.evaluer('!!navigator.serviceWorker.controller'), true)
  })

  await etape('saisie hors ligne, puis envoi au retour du réseau', async () => {
    await page.horsLigne(true)
    await page.aller(BASE + '/meteo')
    await page.attendre('document.querySelector(".meteo-actuel")') // prévisions gardées sur le téléphone
    await page.aller(BASE + '/journal/vaovao')
    await page.cliquer('Semis')
    await page.cliquer('Maïs')
    await page.cliquer('Il y a 7 jours')
    await page.cliquer('Enregistrer')
    await page.attendre('location.pathname === "/journal"', 5000)
    await page.attendre('document.querySelector(".connexion-attente")?.textContent === "1"')
    assert.equal((await api('/api/observations')).total, 0)
    await page.horsLigne(false)
    await page.evaluer('window.dispatchEvent(new Event("online"))')
    await page.attendre('!document.querySelector(".connexion-attente")', 8000)
    const { donnees } = await api('/api/observations')
    assert.equal(donnees.length, 1)
    assert.equal(donnees[0].cultureCode, 'katsaka')
  })

  await etape('suppression puis « Annuler »', async () => {
    await page.aller(BASE + '/journal')
    await page.cliquer('Supprimer')
    await page.attendre('document.querySelectorAll(".observation").length === 0')
    assert.match(await page.texte('.annonce-texte'), /Supprimé/)
    await page.cliquer('Annuler')
    await page.attendre('document.querySelectorAll(".observation").length === 1')
  })

  await etape('bilan des 6 derniers mois', async () => {
    await page.aller(BASE + '/journal/tatitra')
    assert.equal(await page.texte('.entete-titre'), 'Bilan')
    assert.equal(await page.texte('.bilan-chiffre strong'), '1') // 1 semis
    await page.cliquer('Voir en tableau')
    await page.attendre('document.querySelector(".bilan-tableau")')
  })

  await etape('paramètres : texte agrandi, retour au malagasy', async () => {
    await page.aller(BASE + '/fikirana')
    await page.cliquer('Grande')
    assert.equal(await page.evaluer('getComputedStyle(document.documentElement).fontSize'), '21px')
    await page.cliquer('Normale')
    await page.cliquer('Malagasy')
    assert.equal(await page.texte('.entete-titre'), 'Fikirana')
  })

  await etape('aucun débordement horizontal (320 px, tablette, ordinateur)', async () => {
    for (const [l, h, mobile] of [[320, 640, true], [768, 1024, true], [1440, 900, false]]) {
      await page.taille(l, h, mobile)
      for (const url of ['/', '/meteo', '/journal', '/journal/tatitra']) {
        await page.aller(BASE + url)
        assert.equal(await page.evaluer('document.documentElement.scrollWidth <= innerWidth'), true, `${l} px ${url}`)
      }
    }
    await page.taille(390, 844)
  })

  console.log('\nAccessibilité (WCAG 2.1 AA, axe-core)')
  const ecrans = ['/', '/meteo', '/alertes', '/journal', '/journal/vaovao', '/journal/tatitra', '/conseils', '/fikirana', '/mombamomba']
  for (const [langue, theme] of [['mg', 'clair'], ['fr', 'clair'], ['mg', 'sombre'], ['mg', 'soleil']]) {
    const sombre = theme !== 'clair' && theme // nom du mode, pour les messages
    await etape(`${ecrans.length} écrans, ${langue}${sombre ? `, mode ${sombre}` : ''}`, async () => {
      await page.evaluer(`localStorage.setItem('tantsaha-langue', '${langue}'); localStorage.setItem('tantsaha-theme', '${theme}')`)
      for (const url of ecrans) {
        await page.aller(BASE + url)
        await auditer(page, `${url} (${langue}${sombre ? `, ${sombre}` : ''})`)
      }
    })
  }
  await etape('aucune erreur JavaScript', async () => {
    assert.deepEqual(page.erreurs, [])
  })
} finally {
  page.fermer()
  serveur.kill()
}

const echecs = resultats.filter((r) => !r.ok).length
console.log(`\n${resultats.length - echecs} réussi(s), ${echecs} échec(s)`)
process.exitCode = echecs ? 1 : 0
