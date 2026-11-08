import { existsSync } from 'node:fs'
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
