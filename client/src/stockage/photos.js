import { base } from './journal'

// Photos du journal (un parasite, une maladie, l'état d'une parcelle) :
// gardées sur le téléphone seulement, réduites pour ne pas remplir la mémoire
// (1 024 px au plus, JPEG : 100 à 200 Ko). Elles ne partent pas vers le serveur :
// on les montre au technicien ou on les partage avec « Zarao ».
const COTE_MAX = 1024

export async function reduirePhoto(fichier) {
  const image = await createImageBitmap(fichier)
  const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height))
  const toile = document.createElement('canvas')
  toile.width = Math.round(image.width * echelle)
  toile.height = Math.round(image.height * echelle)
  toile.getContext('2d').drawImage(image, 0, 0, toile.width, toile.height)
  image.close?.()
  return new Promise((ok, echec) => toile.toBlob((blob) => (blob ? ok(blob) : echec(new Error('photo'))), 'image/jpeg', 0.72))
}

export const enregistrerPhoto = async (idClient, blob) => (await base).put('photos', blob, idClient)
export const lirePhoto = async (idClient) => (await base).get('photos', idClient)

// Au démarrage : photos dont l'observation a été supprimée (et le délai pour
// « Averina » est passé depuis longtemps)
export async function nettoyerPhotos() {
  const db = await base
  const observations = new Set(await db.getAllKeys('observations'))
  for (const idClient of await db.getAllKeys('photos')) {
    if (!observations.has(idClient)) await db.delete('photos', idClient)
  }
}
