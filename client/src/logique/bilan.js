// Bilan du journal : nombre d'observations de chaque type, mois par mois,
// sur les 6 derniers mois (mois en cours compris). Fonction pure, testée.

export const TYPES_BILAN = ['semis', 'recolte', 'pluie', 'parasite']

export function bilanParMois(observations, aujourdhui, nombreMois = 6) {
  const [annee, mois] = aujourdhui.split('-').map(Number)
  // liste des mois, du plus ancien au plus récent : « 2026-06 », … « 2026-11 »
  const listeMois = Array.from({ length: nombreMois }, (_, i) => {
    const d = new Date(annee, mois - 1 - (nombreMois - 1 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const parType = Object.fromEntries(TYPES_BILAN.map((type) => [type, listeMois.map(() => 0)]))
  for (const o of observations) {
    const rang = listeMois.indexOf(o.dateObservation.slice(0, 7))
    if (rang >= 0 && parType[o.type]) parType[o.type][rang] += 1
  }

  const totaux = Object.fromEntries(TYPES_BILAN.map((type) => [type, parType[type].reduce((a, b) => a + b, 0)]))
  return { mois: listeMois, parType, totaux, total: Object.values(totaux).reduce((a, b) => a + b, 0) }
}
