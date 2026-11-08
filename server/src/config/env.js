// Configuration de l'API, lue depuis les variables d'environnement (.env).
// Centraliser ici évite d'écrire des valeurs « en dur » dans le code.
import { fileURLToPath } from 'node:url'

// Base de données (DB_MODE) :
// - « postgres » : un serveur PostgreSQL (production), via DATABASE_URL ou DB_HOST…
// - « pglite »   : PostgreSQL en WebAssembly, enregistré dans server/.donnees (développement)
// - « memoire »  : PGlite sans fichier, vidé à chaque lancement (tests automatiques)
const mode = process.env.DB_MODE || (process.env.DATABASE_URL ? 'postgres' : 'pglite')

export const config = {
  port: Number(process.env.PORT) || 5000,
  production: process.env.NODE_ENV === 'production',
  db: {
    mode,
    url: process.env.DATABASE_URL, // adresse complète fournie par l'hébergeur (Neon, Render…)
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'tantsaha_connect',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dossierPglite: process.env.PGLITE_DOSSIER || fileURLToPath(new URL('../../.donnees', import.meta.url)),
  },
  // client React compilé (npm run build), servi par l'API en production
  dossierClient: process.env.DOSSIER_CLIENT || fileURLToPath(new URL('../../../client/dist', import.meta.url)),
}

// Paramètres de connexion pour le pilote « pg » (serveur PostgreSQL)
export const connexionPostgres = (base = config.db.database) =>
  config.db.url
    ? { connectionString: config.db.url }
    : { host: config.db.host, port: config.db.port, database: base, user: config.db.user, password: config.db.password }
