import { calendrier } from '../donnees/calendrier'
import { ajouterJours } from '../utils/dates'

// Suivi des cultures (« Ny voliko ») à partir du journal.
// Chaque semis est une culture en cours, jusqu'à la récolte notée pour cette
// culture (une récolte clôt le plus ancien semis encore ouvert avant elle).
// Fonctions pures : faciles à tester.

const GRACE = 60 // jours après la fin de récolte prévue : au-delà, on considère la culture terminée

export const ecartJours = (debut, fin) => Math.round((Date.parse(fin) - Date.parse(debut)) / 86400000)

export function volyEnCours(observations, aujourdhui) {
  const parCulture = new Map()
  for (const o of observations) {
    if ((o.type !== 'semis' && o.type !== 'recolte') || !calendrier[o.cultureCode]) continue
    if (!parCulture.has(o.cultureCode)) parCulture.set(o.cultureCode, [])
    parCulture.get(o.cultureCode).push(o)
  }

  const enCours = []
  for (const [code, liste] of parCulture) {
    const { cycleMin, cycleMax } = calendrier[code]
    const ouverts = []
    // ordre chronologique ; à date égale, le semis avant la récolte
    liste.sort((a, b) => a.dateObservation.localeCompare(b.dateObservation) || (a.type === 'semis' ? -1 : 1))
    for (const o of liste) {
      if (o.type === 'semis') ouverts.push(o)
      else ouverts.shift() // récolte : clôt le plus ancien semis ouvert
    }
    for (const semis of ouverts) {
      const jours = ecartJours(semis.dateObservation, aujourdhui)
      if (jours < 0 || jours > cycleMax + GRACE) continue
      enCours.push({
        semis,
        cultureCode: code,
        jours,
        cycleMin,
        cycleMax,
        progression: Math.min(1, jours / cycleMin),
        debutRecolte: ajouterJours(semis.dateObservation, cycleMin),
        finRecolte: ajouterJours(semis.dateObservation, cycleMax),
        // croissance → recolte (fenêtre de récolte ouverte) → retard (fenêtre dépassée)
        etat: jours < cycleMin ? 'croissance' : jours <= cycleMax ? 'recolte' : 'retard',
      })
    }
  }
  // d'abord ce qui est prêt à récolter, puis le plus avancé
  const rang = { retard: 0, recolte: 1, croissance: 2 }
  return enCours.sort((a, b) => rang[a.etat] - rang[b.etat] || b.progression - a.progression)
}

// Cultures déjà semées par l'agriculteur (historique), dont c'est la saison
// de semis ce mois-ci et qui ne sont pas déjà en cours
export function semisDeSaison(observations, aujourdhui) {
  const mois = Number(aujourdhui.slice(5, 7))
  const cultivees = new Set(observations.filter((o) => o.type === 'semis').map((o) => o.cultureCode))
  const enCours = new Set(volyEnCours(observations, aujourdhui).map((v) => v.cultureCode))
  return [...cultivees].filter((code) => calendrier[code]?.semis.includes(mois) && !enCours.has(code))
}
