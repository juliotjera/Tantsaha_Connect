import { useSyncExternalStore } from 'react'

// Préférences de la personne : langue (malagasy ou français), taille du texte,
// apparence (clair, plein soleil, sombre), sons, accueil et guide terminés,
// notifications des dangers.
// Gardées sur le téléphone (localStorage) pour être connues dès l'ouverture,
// avant même le premier affichage. Si le stockage est indisponible (navigation
// privée…), l'application garde les valeurs par défaut.

const CLES = {
  langue: 'tantsaha-langue',
  taille: 'tantsaha-taille',
  accueil: 'tantsaha-accueil',
  notifications: 'tantsaha-notifications',
  theme: 'tantsaha-theme',
  son: 'tantsaha-son',
  torolalana: 'tantsaha-torolalana',
}

const THEMES = ['clair', 'soleil', 'sombre']

function lire(cle) {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrire(cle, valeur) {
  try {
    localStorage.setItem(cle, valeur)
  } catch {
    // stockage indisponible : la préférence vaut pour cette visite seulement
  }
}

let etat = {
  langue: lire(CLES.langue) === 'fr' ? 'fr' : 'mg',
  langueChoisie: lire(CLES.langue) !== null, // sinon : écran de premier lancement
  accueilFini: lire(CLES.accueil) === 'oui',
  taille: lire(CLES.taille) === 'grand' ? 'grand' : 'normal',
  notifications: lire(CLES.notifications) === 'oui',
  theme: THEMES.includes(lire(CLES.theme)) ? lire(CLES.theme) : 'clair', // clair par défaut
  son: lire(CLES.son) !== 'non', // sons et voix de confirmation : actifs par défaut
  torolalanaVue: lire(CLES.torolalana) === 'vue',
}
const abonnes = new Set()

// langue de la page (lecteurs d'écran, césure) et taille du texte
function appliquer() {
  const racine = globalThis.document?.documentElement
  if (!racine) return
  racine.lang = etat.langue
  racine.dataset.taille = etat.taille
  racine.dataset.theme = etat.theme
}
appliquer()

function modifier(changements) {
  etat = { ...etat, ...changements }
  appliquer()
  abonnes.forEach((rappel) => rappel())
}

export function changerLangue(langue) {
  ecrire(CLES.langue, langue)
  modifier({ langue, langueChoisie: true })
}

export function changerTaille(taille) {
  ecrire(CLES.taille, taille)
  modifier({ taille })
}

export function terminerAccueil() {
  ecrire(CLES.accueil, 'oui')
  modifier({ accueilFini: true })
}

export function changerNotifications(actives) {
  ecrire(CLES.notifications, actives ? 'oui' : 'non')
  modifier({ notifications: actives })
}

export function changerTheme(theme) {
  ecrire(CLES.theme, theme)
  modifier({ theme })
}

export function changerSon(actif) {
  ecrire(CLES.son, actif ? 'oui' : 'non')
  modifier({ son: actif })
}

export function terminerTorolalana() {
  ecrire(CLES.torolalana, 'vue')
  modifier({ torolalanaVue: true })
}

export function revoirTorolalana() {
  ecrire(CLES.torolalana, 'non')
  modifier({ torolalanaVue: false })
}

export const langueActuelle = () => etat.langue
export const sonActif = () => etat.son

const sAbonner = (rappel) => {
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

export const usePreferences = () => useSyncExternalStore(sAbonner, () => etat)
