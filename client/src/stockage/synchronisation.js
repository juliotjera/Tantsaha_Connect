import { lireEnAttente, marquerEnvoyes } from './journal'

// Synchronisation du journal avec l'API.
// Le téléphone envoie ce qui a été saisi ou supprimé hors ligne dès qu'il
// retrouve internet. Si l'envoi échoue (réseau coupé, serveur arrêté), rien
// n'est perdu : tout reste sur le téléphone et sera renvoyé à la prochaine
// occasion. Le serveur ignore les doublons, donc renvoyer est sans risque.

export const ADRESSE_API = import.meta.env.VITE_API_URL ?? '/api'
const TAILLE_LOT = 100 // maximum accepté par l'API en une fois

let enCours = null

export function synchroniser() {
  // un seul envoi à la fois ; les appels suivants attendent le même envoi
  enCours ??= envoyer().finally(() => (enCours = null))
  return enCours
}

async function envoyer() {
  if (!navigator.onLine) return false
  try {
    let { creations, suppressions } = await lireEnAttente()
    while (creations.length > 0 || suppressions.length > 0) {
      const lot = {
        creations: creations.slice(0, TAILLE_LOT).map(({ idClient, type, cultureCode, dateObservation, note }) => ({
          idClient,
          type,
          dateObservation,
          // champs vides non envoyés (l'API attend « absent » plutôt que null)
          ...(cultureCode && { cultureCode }),
          ...(note && { note }),
        })),
        suppressions: suppressions.slice(0, TAILLE_LOT),
      }
      const reponse = await fetch(`${ADRESSE_API}/synchronisation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lot),
      })
      if (!reponse.ok) return false
      await marquerEnvoyes(await reponse.json())
      creations = creations.slice(TAILLE_LOT)
      suppressions = suppressions.slice(TAILLE_LOT)
    }
    return true
  } catch {
    return false // réseau indisponible : nouvel essai plus tard
  }
}

// Déclencheurs : au démarrage, au retour d'internet, quand l'application
// revient au premier plan, après chaque modification du journal, et toutes
// les 5 minutes tant qu'elle est ouverte.
export function demarrerSynchronisation() {
  const essayer = () => synchroniser()
  const auPremierPlan = () => document.visibilityState === 'visible' && essayer()
  essayer()
  window.addEventListener('online', essayer)
  window.addEventListener('journal-modifie', essayer)
  document.addEventListener('visibilitychange', auPremierPlan)
  const minuteur = setInterval(essayer, 5 * 60 * 1000)
  return () => {
    window.removeEventListener('online', essayer)
    window.removeEventListener('journal-modifie', essayer)
    document.removeEventListener('visibilitychange', auPremierPlan)
    clearInterval(minuteur)
  }
}
