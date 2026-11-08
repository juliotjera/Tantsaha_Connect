// Notifications des alertes de danger (pluie très forte, vent très fort).
// Envoyées quand l'application est ouverte en arrière-plan, une seule fois
// par alerte et par jour. La personne les active elle-même dans « Fikirana »
// (le téléphone demande alors son autorisation).

import { autoriserNotificationsNatif, natif, notifierNatif } from '../natif'

const CLE_ENVOYEES = 'tantsaha-notifications-envoyees'
// dans l'application, la réponse du téléphone est gardée ici (lue sans attendre)
const CLE_AUTORISATION = 'tantsaha-notifications-autorisation'

export const notificationsPossibles = () => natif || typeof Notification !== 'undefined'

export const autorisation = () => {
  if (natif) {
    try {
      return localStorage.getItem(CLE_AUTORISATION) ?? 'default'
    } catch {
      return 'default'
    }
  }
  return notificationsPossibles() ? Notification.permission : 'unsupported'
}

export async function demanderAutorisation() {
  if (!notificationsPossibles()) return 'unsupported'
  if (natif) {
    const reponse = await autoriserNotificationsNatif()
    try {
      localStorage.setItem(CLE_AUTORISATION, reponse)
    } catch {
      // sans stockage, le téléphone redemandera
    }
    return reponse
  }
  return Notification.requestPermission()
}

function dejaEnvoyees() {
  try {
    return JSON.parse(localStorage.getItem(CLE_ENVOYEES) ?? '{}')
  } catch {
    return {}
  }
}

// Envoie les alertes de danger pas encore notifiées aujourd'hui
export async function notifierDangers(alertes, aujourdhui) {
  if (autorisation() !== 'granted') return
  const envoyees = dejaEnvoyees()
  const nouvelles = alertes.filter((a) => a.niveau === 'danger' && envoyees[a.id] !== aujourdhui)
  if (nouvelles.length === 0) return

  const inscription = natif ? null : await navigator.serviceWorker?.getRegistration?.()
  for (const alerte of nouvelles) {
    const options = { body: alerte.detail, icon: '/icones/icone-192.png', badge: '/icones/icone-192.png', tag: alerte.id, data: { url: '/alertes' } }
    if (natif) await notifierNatif({ id: alerte.id, titre: alerte.titre, texte: alerte.detail })
    else if (inscription) await inscription.showNotification(alerte.titre, options)
    else new Notification(alerte.titre, options)
    envoyees[alerte.id] = aujourdhui
  }
  try {
    localStorage.setItem(CLE_ENVOYEES, JSON.stringify(envoyees))
  } catch {
    // sans stockage, la notification pourra être renvoyée : sans gravité
  }
}
