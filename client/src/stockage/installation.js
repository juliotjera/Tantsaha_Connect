import { useSyncExternalStore } from 'react'

// Installation de l'application sur l'écran d'accueil du téléphone (PWA).
// Le navigateur (Chrome Android, Edge…) annonce qu'elle est installable par
// l'évènement « beforeinstallprompt » : on le garde pour proposer un bouton
// « Installer », bien plus visible que le menu du navigateur.
// Safari (iPhone) ne propose pas cet évènement : le bouton n'apparaît pas.

let invite = null
const abonnes = new Set()
const prevenir = () => abonnes.forEach((rappel) => rappel())

if (typeof window !== 'undefined' && 'addEventListener' in window) {
  window.addEventListener('beforeinstallprompt', (evenement) => {
    evenement.preventDefault() // on affichera notre propre bouton
    invite = evenement
    prevenir()
  })
  window.addEventListener('appinstalled', () => {
    invite = null
    prevenir()
  })
}

export async function installer() {
  if (!invite) return false
  invite.prompt()
  const { outcome } = await invite.userChoice
  invite = null // une invite ne sert qu'une fois
  prevenir()
  return outcome === 'accepted'
}

const sAbonner = (rappel) => {
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

export const useInstallable = () => useSyncExternalStore(sAbonner, () => invite !== null)
