import { openDB } from 'idb'

// Stockage local (IndexedDB, la base de données du navigateur).
// Tout est d'abord enregistré sur le téléphone : l'application fonctionne sans internet.
// - observations : le journal de culture ; « synchronise » dit si l'API l'a reçue
// - suppressions : observations effacées sur le téléphone, à effacer aussi sur le serveur
// - cache        : dernières données utiles hors ligne (météo, lieu choisi…)
// - photos       : photo d'une observation (gardée sur le téléphone seulement)

export const base = openDB('tantsaha-connect', 3, {
  upgrade(db, ancienneVersion) {
    if (ancienneVersion < 1) {
      const observations = db.createObjectStore('observations', { keyPath: 'idClient' })
      observations.createIndex('parDate', 'dateObservation')
    }
    if (ancienneVersion < 2) {
      db.createObjectStore('suppressions')
      db.createObjectStore('cache')
    }
    if (ancienneVersion < 3) db.createObjectStore('photos')
  },
})

// Prévient les écrans (journal, alertes) qu'il faut relire le journal
const EVENEMENT = 'journal-modifie'
export const signalerModification = () => window.dispatchEvent(new Event(EVENEMENT))

export function surModificationJournal(rappel) {
  window.addEventListener(EVENEMENT, rappel)
  return () => window.removeEventListener(EVENEMENT, rappel)
}

// Toutes les observations, la plus récente en premier
export async function listerObservations() {
  const toutes = await (await base).getAll('observations')
  return toutes.sort(
    (a, b) => b.dateObservation.localeCompare(a.dateObservation) || b.creeLe.localeCompare(a.creeLe),
  )
}

export async function ajouterObservation({ type, cultureCode, dateObservation, note, aPhoto = false }) {
  const observation = {
    // identifiant créé sur le téléphone : l'API s'en sert pour éviter les doublons
    idClient: crypto.randomUUID(),
    type,
    cultureCode: cultureCode ?? null,
    dateObservation,
    note: note ?? null,
    creeLe: new Date().toISOString(),
    synchronise: false,
    ...(aPhoto && { aPhoto: true }), // la photo elle-même est dans « photos »
  }
  await (await base).put('observations', observation)
  signalerModification()
  return observation
}

export async function supprimerObservation(idClient) {
  const db = await base
  const transaction = db.transaction(['observations', 'suppressions'], 'readwrite')
  await transaction.objectStore('observations').delete(idClient)
  // gardée en mémoire jusqu'à ce que le serveur l'ait effacée à son tour
  await transaction.objectStore('suppressions').put(true, idClient)
  await transaction.done
  signalerModification()
}

// Annulation d'une suppression (bouton « Averina ») : l'observation revient,
// à renvoyer au serveur au cas où il l'aurait déjà effacée.
export async function restaurerObservation(observation) {
  const db = await base
  const transaction = db.transaction(['observations', 'suppressions'], 'readwrite')
  await transaction.objectStore('suppressions').delete(observation.idClient)
  await transaction.objectStore('observations').put({ ...observation, synchronise: false })
  await transaction.done
  signalerModification()
}

// --- utilisé par la synchronisation ---

export async function lireEnAttente() {
  const db = await base
  const observations = await db.getAll('observations')
  return {
    creations: observations.filter((o) => !o.synchronise && !o.rejete),
    suppressions: await db.getAllKeys('suppressions'),
  }
}

export async function marquerEnvoyes({ enregistres, rejetes, supprimes }) {
  const db = await base
  const transaction = db.transaction(['observations', 'suppressions'], 'readwrite')
  const observations = transaction.objectStore('observations')
  for (const idClient of enregistres) {
    const observation = await observations.get(idClient)
    if (observation) await observations.put({ ...observation, synchronise: true })
  }
  // refusée par le serveur (donnée invalide) : on ne la renvoie plus, mais on la garde
  for (const { idClient } of rejetes) {
    const observation = await observations.get(idClient)
    if (observation) await observations.put({ ...observation, rejete: true })
  }
  for (const idClient of supprimes) await transaction.objectStore('suppressions').delete(idClient)
  await transaction.done
  signalerModification()
}

// --- petit cache clé → valeur ---

export const lireCache = async (cle) => (await base).get('cache', cle)
export const ecrireCache = async (cle, valeur) => (await base).put('cache', valeur, cle)
