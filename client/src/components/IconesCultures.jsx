import { createLucideIcon } from 'lucide-react'

// Pictogrammes des cultures absentes de la bibliothèque Lucide,
// dessinés dans le même style (trait arrondi, grille de 24 × 24)
// pour que toutes les icônes de l'application se ressemblent.

// Katsaka (maïs) : un épi avec ses grains et deux feuilles
export const Mais = createLucideIcon('Mais', [
  ['path', { d: 'M12 3c-2.4 0-4 3.6-4 8.5S9.6 21 12 21s4-4.6 4-9.5S14.4 3 12 3Z', key: 'epi' }],
  ['path', { d: 'M9 8h6M8.4 12h7.2M9 16h6M12 3v18', key: 'grains' }],
  ['path', { d: 'M8.3 16C5.6 15 4 12.5 3.5 9c2.4.6 4 2 5 4', key: 'feuille-g' }],
  ['path', { d: 'M15.7 16c2.7-1 4.3-3.5 4.8-7-2.4.6-4 2-5 4', key: 'feuille-d' }],
])

// Mangahazo (manioc) : une tige et des racines tubéreuses allongées
export const Manioc = createLucideIcon('Manioc', [
  ['path', { d: 'M12 2v5', key: 'tige' }],
  ['path', { d: 'M9.5 3.5 12 5l2.5-1.5', key: 'feuilles' }],
  ['path', { d: 'M12 7c-3 1.5-5.2 5.5-6 13 3-2.2 5-6.5 6-13Z', key: 'racine-g' }],
  ['path', { d: 'M12 7c3 1.5 5.2 5.5 6 13-3-2.2-5-6.5-6-13Z', key: 'racine-d' }],
  ['path', { d: 'M12 7v14', key: 'racine-c' }],
])

// Voatabia (tomate) : un fruit rond et sa couronne de sépales
export const Tomate = createLucideIcon('Tomate', [
  ['circle', { cx: '12', cy: '14', r: '7', key: 'fruit' }],
  ['path', { d: 'M12 7V3.5', key: 'pedoncule' }],
  ['path', { d: 'M12 7 8.5 5.5M12 7l3.5-1.5M12 7 9.5 9.2M12 7l2.5 2.2', key: 'sepales' }],
])
