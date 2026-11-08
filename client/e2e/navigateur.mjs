// Outils des tests de bout en bout : pilote Chrome (déjà installé) par le
// protocole DevTools, sans dépendance native à installer.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHEMINS_CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

export const pause = (ms) => new Promise((ok) => setTimeout(ok, ms))

export async function ouvrirNavigateur(port = 9400) {
  const chemin = CHEMINS_CHROME.find((c) => existsSync(c))
  if (!chemin) throw new Error('Chrome introuvable : indiquez son chemin dans CHROME_PATH')
  const processus = spawn(chemin, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--hide-scrollbars',
    '--no-first-run',
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tantsaha-e2e-'))}`,
    'about:blank',
  ])
  let cible
  for (let essai = 0; essai < 40 && !cible; essai++) {
    await pause(250)
    cible = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })
      .then((r) => r.json())
      .catch(() => null)
  }
  if (!cible) throw new Error('Chrome ne répond pas')

  const ws = new WebSocket(cible.webSocketDebuggerUrl)
  await new Promise((ok) => ws.addEventListener('open', ok))
  let numero = 0
  const ecouteurs = new Set()
  ws.addEventListener('message', (e) => {
    const message = JSON.parse(e.data)
    if (message.method) ecouteurs.forEach((f) => f(message))
  })

  const envoyer = (method, params = {}) =>
    new Promise((ok, ko) => {
      const id = ++numero
      const reponse = (e) => {
        const m = JSON.parse(e.data)
        if (m.id !== id) return
        ws.removeEventListener('message', reponse)
        m.error ? ko(new Error(`${method} : ${m.error.message}`)) : ok(m.result)
      }
      ws.addEventListener('message', reponse)
      ws.send(JSON.stringify({ id, method, params }))
    })

  const erreurs = []
  ecouteurs.add((m) => {
    if (m.method === 'Runtime.exceptionThrown') erreurs.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text)
  })
  await envoyer('Runtime.enable')
  await envoyer('Page.enable')
  await envoyer('Network.enable')

  const page = {
    envoyer,
    erreurs,
    ecouter: (f) => ecouteurs.add(f),
    async evaluer(code) {
      const r = await envoyer('Runtime.evaluate', { expression: code, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
      return r.result?.value
    },
    async aller(url) {
      await envoyer('Page.navigate', { url })
      await page.attendre('document.readyState === "complete" && !!document.querySelector(".application")', 10000)
      await pause(400)
    },
    // attend qu'une expression soit vraie (ou échoue après le délai)
    async attendre(expression, delai = 8000) {
      const fin = Date.now() + delai
      while (Date.now() < fin) {
        if (await page.evaluer(`!!(${expression})`).catch(() => false)) return
        await pause(150)
      }
      throw new Error(`délai dépassé : ${expression}`)
    },
    // clic sur le bouton ou lien dont le libellé (ou aria-label) contient ce texte
    async cliquer(texte) {
      const ok = await page.evaluer(`(() => {
        const el = [...document.querySelectorAll('button, a')].find((b) =>
          ((b.getAttribute('aria-label') || '') + ' ' + b.textContent).includes(${JSON.stringify(texte)}) && !b.disabled)
        if (!el) return false
        el.click()
        return true
      })()`)
      if (!ok) throw new Error(`bouton introuvable : « ${texte} »`)
      await pause(350)
    },
    texte: (selecteur) => page.evaluer(`document.querySelector(${JSON.stringify(selecteur)})?.textContent.trim() ?? null`),
    taille: (largeur, hauteur, mobile = true) =>
      envoyer('Emulation.setDeviceMetricsOverride', { width: largeur, height: hauteur, deviceScaleFactor: 1, mobile }),
    horsLigne: (oui) =>
      envoyer('Network.emulateNetworkConditions', { offline: oui, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }),
    theme: (sombre) => envoyer('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: sombre ? 'dark' : 'light' }] }),
    fermer() {
      ws.close()
      processus.kill()
    },
  }
  return page
}
