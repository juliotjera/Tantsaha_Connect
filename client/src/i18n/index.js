import { usePreferences } from '../stockage/preferences'
import { textes } from './textes'

// Traduction : traduire('fr', 'journal.jour', { n: 3 }) → « jour 3 »
export function traduire(langue, cle, valeurs = {}) {
  const texte = textes[cle]?.[langue] ?? textes[cle]?.mg ?? cle
  return texte.replace(/\{(\w+)\}/g, (_, nom) => valeurs[nom] ?? '')
}

// Nom d'un élément de données qui a un nom malagasy (nom) et français (nomFr)
export const nomDans = (langue, element) => (langue === 'fr' ? element.nomFr ?? element.nom : element.nom)

// Nom d'un lieu : la ville, ou « près de … » pour une position GPS
export const nomLieu = (langue, lieu) => (lieu.pres ? traduire(langue, 'lieu.pres', { nom: lieu.pres }) : lieu.nom)

// Dans les composants : const { t, langue, nom, lieu } = useT()
export function useT() {
  const { langue } = usePreferences()
  return {
    langue,
    t: (cle, valeurs) => traduire(langue, cle, valeurs),
    nom: (element) => nomDans(langue, element),
    lieu: (lieu) => nomLieu(langue, lieu),
  }
}
