import { requete } from '../db/pool.js'
import { ErreurApi } from '../utils/ErreurApi.js'
import { creerObservationSchema } from '../validators/observation.schema.js'

// Couche « service » : la logique métier et le SQL.
// Les contrôleurs ne parlent jamais directement à la base.

// Colonnes renvoyées au client, en camelCase (convention JavaScript)
const COLONNES = `
  o.id, o.type, o.date_observation AS "dateObservation", o.note,
  o.id_client AS "idClient", o.cree_le AS "creeLe",
  c.code AS "cultureCode", c.nom_mg AS "cultureNomMg"`

export async function listerObservations({ type, page, limite }) {
  const parametres = []
  let filtre = ''
  if (type) {
    parametres.push(type)
    filtre = `WHERE o.type = $${parametres.length}`
  }
  const total = await requete(`SELECT count(*)::int AS n FROM observations o ${filtre}`, parametres)

  parametres.push(limite, (page - 1) * limite)
  const { rows } = await requete(
    `SELECT ${COLONNES}
       FROM observations o LEFT JOIN cultures c ON c.id = o.culture_id
       ${filtre}
      ORDER BY o.date_observation DESC, o.cree_le DESC
      LIMIT $${parametres.length - 1} OFFSET $${parametres.length}`,
    parametres,
  )
  return { donnees: rows, page, limite, total: total.rows[0].n }
}

export async function creerObservation({ type, cultureCode, dateObservation, note, idClient }) {
  let cultureId = null
  if (cultureCode) {
    const culture = await requete('SELECT id FROM cultures WHERE code = $1', [cultureCode])
    if (culture.rowCount === 0) throw new ErreurApi(400, `Culture inconnue : ${cultureCode}`)
    cultureId = culture.rows[0].id
  }

  // Envoi en double (ex. synchronisation après une coupure) : on renvoie
  // l'observation déjà enregistrée au lieu de créer un doublon.
  const { rows } = await requete(
    `WITH ajout AS (
       INSERT INTO observations (type, culture_id, date_observation, note, id_client)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_client) DO NOTHING
       RETURNING id
     )
     SELECT id, true AS nouveau FROM ajout
     UNION ALL
     SELECT id, false FROM observations WHERE id_client = $5 AND NOT EXISTS (SELECT 1 FROM ajout)`,
    [type, cultureId, dateObservation, note ?? null, idClient ?? null],
  )
  const observation = await trouverObservation(rows[0].id)
  return { observation, nouveau: rows[0].nouveau }
}

export async function trouverObservation(id) {
  const { rows } = await requete(
    `SELECT ${COLONNES} FROM observations o LEFT JOIN cultures c ON c.id = o.culture_id WHERE o.id = $1`,
    [id],
  )
  if (rows.length === 0) throw new ErreurApi(404, 'Observation introuvable')
  return rows[0]
}

export async function supprimerObservation(id) {
  const { rowCount } = await requete('DELETE FROM observations WHERE id = $1', [id])
  if (rowCount === 0) throw new ErreurApi(404, 'Observation introuvable')
}

// Synchronisation : enregistre les observations saisies hors ligne et applique
// les suppressions. Peut être rejouée sans risque (doublons ignorés grâce à
// idClient, suppression d'une observation déjà absente sans erreur).
// Renvoie, pour chaque idClient, ce qui a été fait, afin que le téléphone
// sache quoi marquer comme envoyé et quoi garder pour plus tard.
export async function synchroniser({ creations, suppressions }) {
  const enregistres = []
  const rejetes = []
  for (const brute of creations) {
    const verification = creerObservationSchema.safeParse(brute)
    if (!verification.success) {
      rejetes.push({ idClient: brute.idClient, erreur: verification.error.issues[0].message })
      continue
    }
    try {
      await creerObservation(verification.data)
      enregistres.push(brute.idClient)
    } catch (erreur) {
      if (!(erreur instanceof ErreurApi)) throw erreur // panne de la base : tout sera renvoyé plus tard
      rejetes.push({ idClient: brute.idClient, erreur: erreur.message })
    }
  }

  if (suppressions.length > 0) {
    await requete('DELETE FROM observations WHERE id_client = ANY($1::text[])', [suppressions])
  }
  return { enregistres, rejetes, supprimes: suppressions }
}

export async function listerCultures() {
  const { rows } = await requete(
    'SELECT code, nom_mg AS "nomMg", nom_fr AS "nomFr", icone FROM cultures ORDER BY id',
  )
  return rows
}
