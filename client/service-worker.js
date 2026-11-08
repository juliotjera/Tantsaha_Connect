// Service worker de Tantsaha Connect : l'application s'ouvre et fonctionne sans internet.
// Ce fichier est un modèle : à la compilation (npm run build), le plugin de
// vite.config.js remplace __VERSION__ et __FICHIERS__ par la liste exacte des
// fichiers produits, et l'écrit dans dist/sw.js.
//
// Stratégie :
// - à l'installation, tous les fichiers de l'application sont mis en cache
// - les écrans (/, /meteo, /journal…) sont servis depuis le cache : ouverture immédiate,
//   même sans réseau (c'est React Router qui affiche le bon écran)
// - l'API (/api) et la météo passent toujours par le réseau : leurs données
//   hors ligne sont gérées par l'application elle-même (IndexedDB)
// - une nouvelle version s'installe en arrière-plan ; l'application propose de l'activer

const VERSION = '__VERSION__'
const FICHIERS = __FICHIERS__
const CACHE = `tantsaha-${VERSION}`

// on ne garde que des réponses complètes (200) : une réponse vide (204) ou partielle (206),
// renvoyée par un filtre réseau par exemple, priverait l'application de ses messages vocaux
self.addEventListener('install', (evenement) => {
  evenement.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        FICHIERS.map(async (fichier) => {
          const reponse = await fetch(fichier, { cache: 'reload' })
          if (reponse.status === 200) await cache.put(fichier, reponse)
          else if (!fichier.startsWith('/audio/')) throw new Error(`${fichier} : ${reponse.status}`)
        }),
      ),
    ),
  )
})

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    (async () => {
      const noms = await caches.keys()
      await Promise.all(noms.filter((nom) => nom.startsWith('tantsaha-') && nom !== CACHE).map((nom) => caches.delete(nom)))
      await self.clients.claim()
    })(),
  )
})

// Appui sur une notification de danger : ouvre (ou ramène) l'application sur les alertes
self.addEventListener('notificationclick', (evenement) => {
  evenement.notification.close()
  const url = evenement.notification.data?.url ?? '/'
  evenement.waitUntil(
    (async () => {
      const fenetres = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const ouverte = fenetres.find((f) => new URL(f.url).origin === self.location.origin)
      if (ouverte) {
        await ouverte.focus()
        return ouverte.navigate(url)
      }
      return self.clients.openWindow(url)
    })(),
  )
})

// L'application demande d'activer la nouvelle version (bouton « Havaozina »)
self.addEventListener('message', (evenement) => {
  if (evenement.data?.type === 'activer') self.skipWaiting()
})

self.addEventListener('fetch', (evenement) => {
  const { request } = evenement
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  if (request.method !== 'GET' && request.method !== 'HEAD') return

  // navigation vers un écran : la page de l'application, depuis le cache
  if (request.mode === 'navigate') {
    evenement.respondWith(caches.match('/index.html').then((page) => page ?? fetch(request)))
    return
  }

  // autres fichiers : cache d'abord, sinon réseau (et mise en cache des nouveaux messages audio)
  evenement.respondWith(
    (async () => {
      const enCache = await caches.match(request, { ignoreMethod: true, ignoreSearch: true })
      if (enCache?.status === 200) return enCache
      const reponse = await fetch(request)
      if (request.method === 'GET' && reponse.status === 200 && url.pathname.startsWith('/audio/')) {
        const cache = await caches.open(CACHE)
        cache.put(request, reponse.clone())
      }
      return reponse
    })(),
  )
})
