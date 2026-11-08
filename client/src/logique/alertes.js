import { Bug, CloudRain, ShoppingBasket, SprayCan, Sprout, Sun, Wind } from 'lucide-react'
import { trouverCulture } from '../donnees/cultures'
import { ajouterJours, formaterDate, nomJour } from '../utils/dates'
import { millimetres } from '../utils/nombres'
import { fenetreTraitement } from './meteo'
import { semisDeSaison, volyEnCours } from './voly'

// Calcul des alertes à partir des prévisions météo et du journal de culture.
// Fonction pure (mêmes données → mêmes alertes) : facile à tester.
// Trois niveaux seulement, pour rester lisibles :
// - danger    (rouge)  : risque de perte de récolte ou de dégâts, agir vite
// - vigilance (orange) : à surveiller
// - info      (vert)   : rappel utile du calendrier (récolter, semer)
// Chaque alerte renvoie vers un conseil (que faire ?) et a son message vocal malagasy.

export const SEUILS = {
  pluieDanger: 50,      // mm en un jour : risque d'inondation
  pluieVigilance: 20,   // mm en un jour
  rafalesDanger: 75,    // km/h : dégâts sur les cultures et les toits
  rafalesVigilance: 50, // km/h
  chaleur: 35,          // °C
  secheresse: 2,        // mm sur 7 jours, quand des semis sont récents
  joursSemisRecent: 30,
  joursParasite: 7,
  pluieRecolte: 20,     // mm sur les 3 prochains jours : récolter avant la pluie
}

const ORDRE = { danger: 0, vigilance: 1, info: 2 }

// Titres et phrases des alertes, en malagasy et en français
const TEXTES = {
  mg: {
    pluieDanger: 'Orana mahery be',
    pluie: 'Orana be',
    inondation: '. Mety hisy tondra-drano.',
    ventDanger: 'Rivotra mahery be',
    vent: 'Rivotra mahery',
    chaleur: 'Hafanana mafy',
    secheresse: 'Tsy hisy orana',
    secheresseDetail: 'Tsy hisy orana mandritra ny 7 andro. Tondrahy ny voly vao nafafy.',
    parasite: 'Bibikely hita',
    parasiteDetail: '. Jereo ny voly hafa.',
    recolteAvantPluie: "Jinjao alohan'ny orana",
    recolte: 'Efa azo jinjaina',
    recolteDetail: (culture, date, jours) => `${culture}, nafafy ${date} (${jours} andro)`,
    pluieMm: (mm) => `. Orana ${millimetres(mm)}`,
    semis: 'Fotoana famafazana',
    semisDetail: (culture) => `${culture} : fotoana tsara hamafazana izao volana izao.`,
    traitement: 'Tsara hanaovana fanafody',
    heure: (h) => `${h}:00`,
    demain: 'Rahampitso ',
    traitementDetail: (debut, fin) => `${debut} ka hatramin'ny ${fin}. Tsy misy orana, malemy ny rivotra.`,
  },
  fr: {
    pluieDanger: 'Pluie très forte',
    pluie: 'Forte pluie',
    inondation: ". Risque d'inondation.",
    ventDanger: 'Vent très fort',
    vent: 'Vent fort',
    chaleur: 'Forte chaleur',
    secheresse: 'Pas de pluie prévue',
    secheresseDetail: 'Pas de pluie pendant 7 jours. Arrosez les jeunes semis.',
    parasite: 'Parasites repérés',
    parasiteDetail: '. Vérifiez les autres cultures.',
    recolteAvantPluie: 'Récoltez avant la pluie',
    recolte: 'Prête à récolter',
    recolteDetail: (culture, date, jours) => `${culture}, semé le ${date} (${jours} jours)`,
    pluieMm: (mm) => `. Pluie : ${millimetres(mm)}`,
    semis: 'Saison des semis',
    semisDetail: (culture) => `${culture} : c'est le bon mois pour semer.`,
    traitement: 'Bon moment pour traiter',
    heure: (h) => `${h} h`,
    demain: 'Demain ',
    traitementDetail: (debut, fin) => `De ${debut} à ${fin}. Pas de pluie, vent faible.`,
  },
}

// Premier jour où la valeur est la plus forte
const pire = (jours, champ) => jours.reduce((max, j) => (j[champ] > max[champ] ? j : max), jours[0])

export function calculerAlertes({ previsions, observations = [], aujourdhui, langue = 'mg' }) {
  const T = TEXTES[langue] ?? TEXTES.mg
  const date = (d) => formaterDate(d, langue)
  const quand = (d) => `${nomJour(d, langue)} ${date(d)}`
  const nomCulture = (c) => (langue === 'fr' ? c.nomFr : c.nom)
  const alertes = []
  const jours = previsions?.jours ?? []

  if (jours.length > 0) {
    const pluvieux = pire(jours, 'pluie')
    if (pluvieux.pluie >= SEUILS.pluieVigilance) {
      const danger = pluvieux.pluie >= SEUILS.pluieDanger
      alertes.push({
        id: 'pluie',
        niveau: danger ? 'danger' : 'vigilance',
        Icone: CloudRain,
        titre: danger ? T.pluieDanger : T.pluie,
        detail: `${millimetres(pluvieux.pluie)}, ${quand(pluvieux.date)}${danger ? T.inondation : ''}`,
        date: pluvieux.date,
        conseil: 'orana-mahery',
        audio: danger ? 'alerte-orana-mahery-be' : 'alerte-orana-be',
      })
    }

    const venteux = pire(jours, 'rafales')
    if (venteux.rafales >= SEUILS.rafalesVigilance) {
      const danger = venteux.rafales >= SEUILS.rafalesDanger
      alertes.push({
        id: 'vent',
        niveau: danger ? 'danger' : 'vigilance',
        Icone: Wind,
        titre: danger ? T.ventDanger : T.vent,
        detail: `${venteux.rafales} km/h, ${quand(venteux.date)}`,
        date: venteux.date,
        conseil: 'rivotra',
        audio: danger ? 'alerte-rivotra-mahery-be' : 'alerte-rivotra-mahery',
      })
    }

    const chaud = pire(jours, 'tmax')
    if (chaud.tmax >= SEUILS.chaleur) {
      alertes.push({
        id: 'chaleur',
        niveau: 'vigilance',
        Icone: Sun,
        titre: T.chaleur,
        detail: `${chaud.tmax}°, ${quand(chaud.date)}`,
        date: chaud.date,
        conseil: 'haintany',
        audio: 'alerte-hafanana',
      })
    }

    // Pas de pluie pendant 7 jours alors que des semis sont jeunes : ils risquent de sécher
    const pluieTotale = jours.reduce((somme, j) => somme + j.pluie, 0)
    const limiteSemis = ajouterJours(aujourdhui, -SEUILS.joursSemisRecent)
    const semisRecents = observations.filter((o) => o.type === 'semis' && o.dateObservation >= limiteSemis)
    if (pluieTotale < SEUILS.secheresse && semisRecents.length > 0) {
      alertes.push({
        id: 'secheresse',
        niveau: 'vigilance',
        Icone: Sun,
        titre: T.secheresse,
        detail: T.secheresseDetail,
        date: aujourdhui,
        conseil: 'haintany',
        audio: 'alerte-tsy-hisy-orana',
      })
    }
  }

  // Parasites notés récemment dans le journal : un seul message par culture
  const limiteParasite = ajouterJours(aujourdhui, -SEUILS.joursParasite)
  const parasites = observations.filter((o) => o.type === 'parasite' && o.dateObservation >= limiteParasite)
  const parCulture = new Map()
  for (const o of parasites) {
    const cle = o.cultureCode ?? 'tous'
    if (!parCulture.has(cle) || parCulture.get(cle).dateObservation < o.dateObservation) parCulture.set(cle, o)
  }
  for (const [cle, o] of parCulture) {
    const culture = trouverCulture(cle)
    alertes.push({
      id: `parasite-${cle}`,
      niveau: 'vigilance',
      Icone: Bug,
      Culture: culture?.Icone,
      titre: T.parasite,
      detail: `${culture ? `${nomCulture(culture)}, ` : ''}${date(o.dateObservation)}${T.parasiteDetail}`,
      date: o.dateObservation,
      conseil: 'bibikely',
      audio: 'alerte-bibikely',
    })
  }

  // Calendrier : récolte prête (ou à avancer si la pluie arrive), saison des semis
  const pluie3Jours = jours.slice(0, 3).reduce((somme, j) => somme + j.pluie, 0)
  const recoltes = new Map() // une alerte par culture, même si plusieurs parcelles
  for (const voly of volyEnCours(observations, aujourdhui)) {
    if (voly.etat === 'croissance' || recoltes.has(voly.cultureCode)) continue
    recoltes.set(voly.cultureCode, voly)
  }
  for (const [code, voly] of recoltes) {
    const culture = trouverCulture(code)
    const pluieProche = pluie3Jours >= SEUILS.pluieRecolte
    alertes.push({
      id: `recolte-${code}`,
      niveau: pluieProche ? 'vigilance' : 'info',
      Icone: pluieProche ? CloudRain : ShoppingBasket,
      Culture: culture.Icone,
      titre: pluieProche ? T.recolteAvantPluie : T.recolte,
      detail:
        T.recolteDetail(nomCulture(culture), date(voly.semis.dateObservation), voly.jours) +
        (pluieProche ? T.pluieMm(Math.round(pluie3Jours)) : ''),
      date: voly.debutRecolte,
      conseil: 'fijinjana',
      audio: pluieProche ? 'alerte-jinjao-alohan-ny-orana' : 'alerte-fijinjana',
    })
  }
  for (const code of semisDeSaison(observations, aujourdhui)) {
    const culture = trouverCulture(code)
    alertes.push({
      id: `semis-${code}`,
      niveau: 'info',
      Icone: Sprout,
      Culture: culture.Icone,
      titre: T.semis,
      detail: T.semisDetail(nomCulture(culture)),
      date: aujourdhui,
      conseil: 'famafazana',
      audio: 'alerte-famafazana',
    })
  }

  // Bon moment pour traiter (pulvériser) les cultures en cours, dans les 24 heures
  const fenetre = previsions?.heures?.length && volyEnCours(observations, aujourdhui).length > 0 && fenetreTraitement(previsions.heures)
  if (fenetre) {
    const jour = fenetre.debut.slice(0, 10)
    const heure = (iso, decalage = 0) => T.heure((Number(iso.slice(11, 13)) + decalage) % 24)
    alertes.push({
      id: 'traitement',
      niveau: 'info',
      Icone: SprayCan,
      titre: T.traitement,
      detail: (jour > aujourdhui ? T.demain : '') + T.traitementDetail(heure(fenetre.debut), heure(fenetre.fin, 1)),
      date: jour,
      conseil: 'bibikely',
      audio: 'alerte-fanafody',
    })
  }

  // le plus grave d'abord, puis par date
  return alertes.sort((a, b) => ORDRE[a.niveau] - ORDRE[b.niveau] || a.date.localeCompare(b.date))
}
