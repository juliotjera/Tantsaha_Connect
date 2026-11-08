// Crée la base si besoin, puis les tables : npm run db:migrer
// Utile seulement avec un serveur PostgreSQL : avec PGlite, c'est fait au démarrage.
import pg from 'pg'
import { config, connexionPostgres } from '../config/env.js'
import { lireSchema } from './pool.js'

// 1) La base existe-t-elle ? Sinon on la crée (connexion à la base « postgres »).
//    Chez un hébergeur (DATABASE_URL), la base est déjà créée.
async function creerBaseSiAbsente() {
  if (config.db.url) return
  const admin = new pg.Client(connexionPostgres('postgres'))
  await admin.connect()
  try {
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.db.database])
    if (rowCount === 0) {
      // nom validé : uniquement lettres, chiffres et _ (pas d'injection possible)
      if (!/^\w+$/.test(config.db.database)) throw new Error('Nom de base invalide')
      await admin.query(`CREATE DATABASE ${config.db.database}`)
      console.log(`✔ Base « ${config.db.database} » créée.`)
    }
  } finally {
    await admin.end()
  }
}

// 2) Tables et données de départ (schema.sql peut être relancé sans danger).
async function appliquerSchema() {
  const client = new pg.Client(connexionPostgres())
  await client.connect()
  try {
    await client.query(await lireSchema())
    const { rows } = await client.query('SELECT count(*)::int AS n FROM cultures')
    console.log(`✔ Tables à jour (${rows[0].n} cultures).`)
  } finally {
    await client.end()
  }
}

if (config.db.mode !== 'postgres') {
  console.log(`Mode ${config.db.mode} : les tables sont créées automatiquement au démarrage de l'API.`)
} else {
  try {
    await creerBaseSiAbsente()
    await appliquerSchema()
  } catch (erreur) {
    console.error('✖ Échec de la migration :', erreur.message)
    if (erreur.code === '28P01') console.error('  → Mot de passe PostgreSQL incorrect : vérifiez DB_PASSWORD dans server/.env')
    process.exitCode = 1
  }
}
