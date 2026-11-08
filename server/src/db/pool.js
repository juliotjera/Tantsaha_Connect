import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { config, connexionPostgres } from '../config/env.js'

// Accès à la base de données, avec la même interface quel que soit le moteur :
// - PostgreSQL (production) : pool de connexions, réutilisées d'une requête à l'autre
// - PGlite (développement, tests) : PostgreSQL compilé en WebAssembly, rien à installer
// Le SQL est identique dans les deux cas : c'est le même moteur PostgreSQL.

const DATE = 1082 // identifiant du type DATE dans PostgreSQL

// Les colonnes DATE sont renvoyées telles quelles (« 2026-11-06 ») au lieu
// d'être converties en objet Date avec un fuseau horaire.
pg.types.setTypeParser(DATE, (valeur) => valeur)

export const lireSchema = () => readFile(new URL('./schema.sql', import.meta.url), 'utf8')

async function connecterPglite() {
  const { PGlite } = await import('@electric-sql/pglite')
  const db = new PGlite({
    dataDir: config.db.mode === 'memoire' ? undefined : config.db.dossierPglite, // sans dossier : en mémoire
    parsers: { [DATE]: (valeur) => valeur },
  })
  // pas de migration séparée : les tables sont créées (ou vérifiées) au démarrage
  await db.exec(await lireSchema())
  return {
    async query(texte, parametres) {
      const resultat = await db.query(texte, parametres)
      // même forme que le pilote « pg » : rows + rowCount
      return { rows: resultat.rows, rowCount: resultat.affectedRows || resultat.rows.length }
    },
    end: () => db.close(),
  }
}

async function connecterPostgres() {
  const pool = new pg.Pool(connexionPostgres())
  // tables créées (ou vérifiées) au démarrage, comme avec PGlite : schema.sql peut être relancé sans danger
  await pool.query(await lireSchema())
  return pool
}

// Connexion ouverte une seule fois, au premier besoin.
// En cas d'échec (base injoignable), on réessaiera à la requête suivante.
let connexion
const base = () => {
  connexion ??= (config.db.mode === 'postgres' ? connecterPostgres() : connecterPglite()).catch((erreur) => {
    connexion = undefined
    throw erreur
  })
  return connexion
}

// Exécute une requête SQL paramétrée ($1, $2…).
// Les paramètres séparés du texte SQL protègent contre l'injection SQL.
export const requete = async (texte, parametres) => (await base()).query(texte, parametres)

export async function fermerBase() {
  if (connexion) await (await connexion).end()
  connexion = undefined
}
