import { typesObservation } from '../donnees/typesObservation'
import { base, signalerModification } from './journal'

// Sauvegarde du journal dans un fichier, pour le retrouver après un changement
// ou une perte de téléphone (ou le donner au technicien de la coopérative).
// Le fichier contient les observations, sans les photos (trop lourdes).
const FORMAT = 'tantsaha-connect-journal'

export async function fichierSauvegarde(aujourdhui) {
  const observations = await (await base).getAll('observations')
  const contenu = {
    format: FORMAT,
    version: 1,
    exporteLe: new Date().toISOString(),
    observations: observations.map(({ idClient, type, cultureCode, dateObservation, note, creeLe }) => ({
      idClient,
      type,
      cultureCode,
      dateObservation,
      note,
      creeLe,
    })),
  }
  return new File([JSON.stringify(contenu, null, 1)], `tantsaha-rakitsoratra-${aujourdhui}.json`, { type: 'application/json' })
}

const TYPES = new Set(typesObservation.map((t) => t.code))
const valide = (o) =>
  typeof o?.idClient === 'string' &&
  o.idClient.length <= 64 &&
  TYPES.has(o.type) &&
  /^\d{4}-\d{2}-\d{2}$/.test(o.dateObservation ?? '') &&
  (o.cultureCode === null || typeof o.cultureCode === 'string')

// Ajoute les observations du fichier qui ne sont pas déjà sur le téléphone.
// Elles seront renvoyées au serveur (qui ignore les doublons grâce à idClient).
// Renvoie le nombre d'observations ajoutées ; lève une erreur si le fichier n'est pas lisible.
export async function importerSauvegarde(fichier) {
  const contenu = JSON.parse(await fichier.text())
  if (contenu?.format !== FORMAT || !Array.isArray(contenu.observations)) throw new Error('format')
  const db = await base
  const existantes = new Set(await db.getAllKeys('observations'))
  const transaction = db.transaction('observations', 'readwrite')
  let ajoutees = 0
  for (const o of contenu.observations) {
    if (!valide(o) || existantes.has(o.idClient)) continue
    await transaction.store.put({
      idClient: o.idClient,
      type: o.type,
      cultureCode: o.cultureCode ?? null,
      dateObservation: o.dateObservation,
      note: typeof o.note === 'string' ? o.note.slice(0, 500) : null,
      creeLe: typeof o.creeLe === 'string' ? o.creeLe : new Date().toISOString(),
      synchronise: false,
    })
    ajoutees++
  }
  await transaction.done
  if (ajoutees) signalerModification()
  return ajoutees
}
