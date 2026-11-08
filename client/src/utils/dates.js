// Outils de dates. Les dates sont gardées au format AAAA-MM-JJ (comme l'API),
// calculées dans le fuseau du téléphone (Madagascar : UTC+3).
// Affichage en malagasy (par défaut) ou en français : paramètre « langue ».

const MOIS = {
  mg: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
}
const JOURS = {
  mg: ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
}
const MOIS_COURTS = {
  mg: ['Jan', 'Feb', 'Mar', 'Apr', 'Mey', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
}
const RELATIFS = {
  mg: { aujourdhui: 'Androany', demain: 'Rahampitso' },
  fr: { aujourdhui: "Aujourd'hui", demain: 'Demain' },
}
const choisir = (table, langue) => table[langue] ?? table.mg

const enTexte = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const aujourdhui = () => enTexte(new Date())

// date locale (AAAA-MM-JJ) d'un instant ISO, ex. l'heure d'un téléchargement
export const dateLocale = (iso) => enTexte(new Date(iso))

export function ajouterJours(date, jours) {
  const [a, m, j] = date.split('-').map(Number)
  return enTexte(new Date(a, m - 1, j + jours))
}

// Nom du jour de la semaine : « Zoma », « Vendredi »
export function jourSemaine(date, langue = 'mg') {
  const [a, m, j] = date.split('-').map(Number)
  return choisir(JOURS, langue)[new Date(a, m - 1, j).getDay()]
}

// « Androany » (aujourd'hui), « Rahampitso » (demain), sinon le nom du jour
export function nomJour(date, langue = 'mg') {
  const relatifs = choisir(RELATIFS, langue)
  if (date === aujourdhui()) return relatifs.aujourdhui
  if (date === ajouterJours(aujourdhui(), 1)) return relatifs.demain
  return jourSemaine(date, langue)
}

// « 19:20 » : heure d'une date ISO, dans le fuseau du téléphone
export function formaterHeure(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Mois d'une clé « AAAA-MM » : court (« Nov », « nov. ») ou complet (« Novambra »)
export function nomMois(cle, langue = 'mg', court = false) {
  const m = Number(cle.slice(5, 7))
  return choisir(court ? MOIS_COURTS : MOIS, langue)[m - 1]
}

// « 6 Novambra 2026 » / « 6 novembre 2026 » ; l'année est omise si c'est l'année en cours
export function formaterDate(date, langue = 'mg') {
  const [a, m, j] = date.split('-').map(Number)
  const annee = a === new Date().getFullYear() ? '' : ` ${a}`
  return `${j} ${choisir(MOIS, langue)[m - 1]}${annee}`
}
