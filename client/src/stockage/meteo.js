import { useSyncExternalStore } from 'react'
import { adresseMeteo, lirePrevisions } from '../logique/meteo'
import { ecrireCache, lireCache } from './journal'

// État de la météo partagé par tous les écrans (Météo, Alertes, Accueil),
// pour ne télécharger les prévisions qu'une fois. Les dernières prévisions
// et le lieu choisi sont gardés sur le téléphone : consultables hors ligne.

const FRAICHEUR = 60 * 60 * 1000 // prévisions retéléchargées au plus une fois par heure

let etat = {
  pret: false,        // cache lu
  lieu: null,         // { id, nom, lat, lon }
  previsions: null,
  recupereLe: null,   // date du téléchargement (ISO)
  chargement: false,
  erreur: false,      // dernier téléchargement échoué
}
const abonnes = new Set()

function modifier(changements) {
  etat = { ...etat, ...changements }
  abonnes.forEach((rappel) => rappel())
}

let demarrage = null
function demarrer() {
  demarrage ??= (async () => {
    const [lieu, meteo] = await Promise.all([lireCache('lieu'), lireCache('meteo')])
    const memeLieu = meteo && lieu && meteo.lieuId === lieu.id
    modifier({
      pret: true,
      lieu: lieu ?? null,
      previsions: memeLieu ? meteo.previsions : null,
      recupereLe: memeLieu ? meteo.recupereLe : null,
    })
    actualiser()
    window.addEventListener('online', () => actualiser())
  })()
}

// Télécharge les prévisions si elles sont trop anciennes (ou si on le demande)
export async function actualiser({ force = false } = {}) {
  const { lieu, recupereLe, chargement } = etat
  if (!lieu || chargement || !navigator.onLine) return
  if (!force && recupereLe && Date.now() - Date.parse(recupereLe) < FRAICHEUR) return

  modifier({ chargement: true })
  try {
    // réseau très lent (2G) : abandon après 20 s plutôt qu'une attente sans fin
    const reponse = await fetch(adresseMeteo(lieu), { signal: AbortSignal.timeout(20000) })
    if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`)
    const previsions = lirePrevisions(await reponse.json())
    if (etat.lieu?.id !== lieu.id) return // le lieu a changé pendant le téléchargement
    const meteo = { lieuId: lieu.id, previsions, recupereLe: new Date().toISOString() }
    await ecrireCache('meteo', meteo)
    modifier({ previsions, recupereLe: meteo.recupereLe, erreur: false })
  } catch {
    modifier({ erreur: true }) // on garde les dernières prévisions connues
  } finally {
    modifier({ chargement: false })
    // lieu changé entre-temps : on télécharge celui qui vient d'être choisi
    if (etat.lieu && etat.lieu.id !== lieu.id) actualiser({ force: true })
  }
}

export async function choisirLieu(lieu) {
  await ecrireCache('lieu', lieu)
  modifier({ lieu, previsions: null, recupereLe: null, erreur: false })
  await actualiser({ force: true })
}

function sAbonner(rappel) {
  demarrer()
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

export const useMeteo = () => useSyncExternalStore(sAbonner, () => etat)
