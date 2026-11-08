// Point d'entrée : démarre l'API Tantsaha Connect.
import { app } from './app.js'
import { config } from './config/env.js'
import { fermerBase, requete } from './db/pool.js'

// Ouvre la base dès le démarrage (avec PGlite : crée les tables) pour
// signaler tout de suite un problème de connexion, sans bloquer l'API.
requete('SELECT 1')
  .then(() => console.log(`Base de données : ${config.db.mode}`))
  .catch((erreur) => console.error(`Base de données (${config.db.mode}) indisponible :`, erreur.message))

if (config.production && config.db.mode !== 'postgres') {
  console.warn('⚠ Production sans PostgreSQL : définissez DATABASE_URL, sinon les données restent sur le disque du serveur.')
}

const serveur = app.listen(config.port, () => {
  console.log(`API Tantsaha Connect lancée sur http://localhost:${config.port}`)
})

// Arrêt propre (Ctrl+C, redémarrage par l'hébergeur) : on ferme la base
// pour ne pas laisser de fichier PGlite à moitié écrit.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    serveur.close()
    fermerBase().finally(() => process.exit(0))
  })
}
