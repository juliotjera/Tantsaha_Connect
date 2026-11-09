import { existsSync } from 'node:fs'
import { Readable } from 'node:stream'
import { extname, join } from 'node:path'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { config } from './config/env.js'
import { gestionErreurs, routeIntrouvable } from './middlewares/erreurs.js'
import { routes } from './routes/index.js'

// Construction de l'application Express (séparée du démarrage dans index.js,
// pour pouvoir la tester sans ouvrir de port).
export const app = express()

app.disable('x-powered-by')            // ne pas annoncer « Express » aux curieux
if (config.production) app.set('trust proxy', 1) // derrière le proxy de l'hébergeur : vraie adresse IP

// En-têtes de sécurité (protection contre l'injection de scripts, le clickjacking…).
// La politique de contenu n'autorise que nos propres fichiers et l'API météo.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'connect-src': ["'self'", 'https://api.open-meteo.com'],
        'media-src': ["'self'"],
        'worker-src': ["'self'"],
      },
    },
  }),
)
app.use(compression())                 // fichiers et réponses compressés : 3 à 4 fois moins de données à télécharger
app.use(cors())                        // le client React (autre port en développement) peut appeler l'API
app.use(express.json({ limit: '100kb' })) // lit le JSON envoyé, taille limitée

// Limite le nombre de requêtes par adresse IP (protection contre les abus)
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { erreur: 'Trop de requêtes, réessayez dans quelques minutes' },
  }),
)
app.use('/api', routes)
app.use('/api', routeIntrouvable)      // 404 en JSON pour une route d'API inconnue

// Application Android : servie depuis le site lui-même. Le serveur récupère la dernière
// version publiée sur GitHub et la transmet telle quelle : le téléphone télécharge depuis
// une seule adresse, sans redirection vers un autre domaine (que le navigateur intégré de
// WhatsApp ou l'application installée gèrent mal : téléchargement bloqué « en cours »).
export const SOURCE_APK = 'https://github.com/juliotjera/Tantsaha_Connect/releases/latest/download/tantsaha-connect.apk'
app.get('/telecharger/tantsaha-connect.apk', async (req, res) => {
  try {
    // délai pour joindre GitHub seulement : le transfert lui-même peut être long (réseau lent)
    const arret = new AbortController()
    const delai = setTimeout(() => arret.abort(), 30000)
    const source = await fetch(SOURCE_APK, { signal: arret.signal }).finally(() => clearTimeout(delai))
    if (!source.ok || !source.body) return res.status(502).json({ erreur: 'Application Android indisponible pour le moment' })
    res.set({
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="tantsaha-connect.apk"',
      'Cache-Control': 'no-cache',
    })
    const taille = source.headers.get('content-length')
    if (taille) res.set('Content-Length', taille)
    const flux = Readable.fromWeb(source.body)
    flux.on('error', () => res.destroy()) // coupure côté GitHub : le téléphone pourra réessayer
    req.on('close', () => flux.destroy()) // téléchargement annulé par le téléphone
    flux.pipe(res)
  } catch {
    // GitHub injoignable : message clair plutôt qu'une erreur 500
    if (!res.headersSent) res.status(502).json({ erreur: 'Application Android indisponible pour le moment' })
  }
})

// En production, l'API sert aussi l'interface React compilée (un seul service à héberger).
// Toute adresse inconnue renvoie index.html : c'est React Router qui choisit l'écran.
if (existsSync(join(config.dossierClient, 'index.html'))) {
  app.use(
    express.static(config.dossierClient, {
      setHeaders(res, chemin) {
        // fichiers à nom unique (assets/index-a1b2.js) : gardés en cache un an ;
        // le reste (index.html, sw.js…) toujours revérifié
        const unique = chemin.startsWith(join(config.dossierClient, 'assets'))
        res.setHeader('Cache-Control', unique ? 'public, max-age=31536000, immutable' : 'no-cache')
      },
    }),
  )
  // (un fichier absent, ex. /audio/inconnu.mp3, reste une vraie 404)
  app.get('/{*chemin}', (req, res, next) =>
    extname(req.path) ? next() : res.sendFile(join(config.dossierClient, 'index.html')),
  )
}

app.use(routeIntrouvable)              // 404 pour toute autre route
app.use(gestionErreurs)                // toujours en dernier
