import { calendrier } from '../donnees/calendrier'
import { volyEnCours } from './voly'

// Almanach de l'année agricole (accueil) : les 12 prochains mois à partir du
// mois en cours, la saison de chacun, et pour chaque culture les mois de semis
// et, si elle est en cours, les mois de récolte prévus. Fonctions pures, testées.

// Hautes Terres : saison des pluies (fahavaratra) de novembre à avril,
// saison sèche (ririnina) de mai à octobre
const MOIS_PLUIES = [11, 12, 1, 2, 3, 4]
export const saisonDuMois = (mois) => (MOIS_PLUIES.includes(mois) ? 'fahavaratra' : 'ririnina')

// « 2026-11 », « 2026-12 », … sur 12 mois à partir de la date donnée
export function douzeMois(aujourdhui) {
  const [annee, mois] = aujourdhui.split('-').map(Number)
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(annee, mois - 1 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

// Mois (« AAAA-MM ») couverts entre deux dates, bornes comprises
function moisEntre(debut, fin) {
  const liste = []
  let [a, m] = debut.split('-').map(Number)
  const [af, mf] = fin.split('-').map(Number)
  while ((a < af || (a === af && m <= mf)) && liste.length < 13) {
    liste.push(`${a}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) {
      m = 1
      a += 1
    }
  }
  return liste
}

// Une ligne par culture : celles que la personne a déjà semées (journal),
// sinon toutes. Pour chaque mois affiché : semis conseillé ? récolte prévue ?
export function lignesAlmanach(observations, aujourdhui) {
  const mois = douzeMois(aujourdhui)
  const semees = [...new Set(observations.filter((o) => o.type === 'semis').map((o) => o.cultureCode))].filter(
    (code) => calendrier[code],
  )
  const codes = semees.length > 0 ? semees : Object.keys(calendrier)
  const enCours = volyEnCours(observations, aujourdhui)

  const lignes = codes.map((code) => {
    const recoltes = new Set(
      enCours.filter((v) => v.cultureCode === code).flatMap((v) => moisEntre(v.debutRecolte, v.finRecolte)),
    )
    return {
      code,
      mois: mois.map((cle) => ({
        cle,
        semis: calendrier[code].semis.includes(Number(cle.slice(5, 7))),
        recolte: recoltes.has(cle),
      })),
    }
  })
  return { mois, lignes, saison: saisonDuMois(Number(aujourdhui.slice(5, 7))), toutes: semees.length === 0 }
}

// Ce mois-ci, en clair (vue simple de l'accueil) : les cultures à semer ce mois
// (calendrier cultural) et les cultures en cours avec leur récolte (journal) :
// prête maintenant, ou la date à partir de laquelle récolter.
export function ceMois(observations, aujourdhui) {
  const mois = Number(aujourdhui.slice(5, 7))
  const aSemer = Object.keys(calendrier).filter((code) => calendrier[code].semis.includes(mois))
  const vues = new Set()
  const recoltes = volyEnCours(observations, aujourdhui)
    .filter((v) => !vues.has(v.cultureCode) && vues.add(v.cultureCode)) // une fois par culture
    .map((v) => ({ code: v.cultureCode, pret: v.etat !== 'croissance', date: v.debutRecolte }))
  return { cle: aujourdhui.slice(0, 7), saison: saisonDuMois(mois), aSemer, recoltes }
}
