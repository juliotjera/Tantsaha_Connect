import { useSyncExternalStore } from 'react'

// Annonces : court message en bas de l'écran après une action (supprimé,
// récolte notée…), avec un bouton pour l'annuler. Une seule à la fois ;
// elle disparaît d'elle-même après quelques secondes.
let annonce = null
let minuteur = null
const abonnes = new Set()
const prevenir = () => abonnes.forEach((rappel) => rappel())

export function annoncer({ texte, annuler, duree = 8000 }) {
  clearTimeout(minuteur)
  annonce = { id: Date.now(), texte, annuler }
  prevenir()
  minuteur = setTimeout(fermerAnnonce, duree)
}

export function fermerAnnonce() {
  clearTimeout(minuteur)
  annonce = null
  prevenir()
}

const sAbonner = (rappel) => {
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

export const useAnnonce = () => useSyncExternalStore(sAbonner, () => annonce)
