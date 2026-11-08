import { describe, expect, test } from 'vitest'
import { ajouterJours } from '../utils/dates'
import { calculerAlertes } from './alertes'

const AUJOURDHUI = '2026-11-06'

// 7 jours calmes, modifiables jour par jour
const semaine = (modifs = {}) => ({
  jours: Array.from({ length: 7 }, (_, i) => ({
    date: ajouterJours(AUJOURDHUI, i),
    code: 3,
    tmax: 28,
    tmin: 16,
    pluie: 1,
    probaPluie: 30,
    rafales: 20,
    ...modifs[i],
  })),
})

const alertes = (previsions, observations) => calculerAlertes({ previsions, observations, aujourdhui: AUJOURDHUI })

describe('alertes météo', () => {
  test('semaine calme : aucune alerte', () => {
    expect(alertes(semaine())).toEqual([])
  })

  test('pluie de 60 mm : danger (rouge), avec le jour concerné', () => {
    const [alerte] = alertes(semaine({ 2: { pluie: 60 } }))
    expect(alerte).toMatchObject({ id: 'pluie', niveau: 'danger', date: '2026-11-08', conseil: 'orana-mahery' })
  })

  test('pluie de 25 mm : vigilance (orange)', () => {
    expect(alertes(semaine({ 1: { pluie: 25 } }))[0]).toMatchObject({ id: 'pluie', niveau: 'vigilance' })
  })

  test('une seule alerte de pluie, pour le pire jour', () => {
    const resultat = alertes(semaine({ 1: { pluie: 30 }, 4: { pluie: 70 } }))
    expect(resultat.filter((a) => a.id === 'pluie')).toHaveLength(1)
    expect(resultat[0]).toMatchObject({ niveau: 'danger', date: '2026-11-10' })
  })

  test('rafales et chaleur', () => {
    const resultat = alertes(semaine({ 0: { rafales: 80 }, 3: { tmax: 37 } }))
    expect(resultat.map((a) => [a.id, a.niveau])).toEqual([
      ['vent', 'danger'],
      ['chaleur', 'vigilance'],
    ])
  })

  test('pas de pluie : alerte seulement si des semis sont récents', () => {
    const sec = semaine(Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, { pluie: 0 }])))
    expect(alertes(sec, [])).toEqual([])

    const semis = [{ type: 'semis', cultureCode: 'katsaka', dateObservation: '2026-10-25' }]
    expect(alertes(sec, semis)).toMatchObject([{ id: 'secheresse', niveau: 'vigilance' }])

    const ancien = [{ type: 'semis', cultureCode: 'katsaka', dateObservation: '2026-08-01' }]
    expect(alertes(sec, ancien)).toEqual([])
  })

  test('sans prévisions (jamais en ligne) : pas d\'erreur', () => {
    expect(alertes(null, [])).toEqual([])
  })
})

describe('alertes du journal', () => {
  test('parasites récents : une alerte par culture, la plus récente', () => {
    const observations = [
      { type: 'parasite', cultureCode: 'voatabia', dateObservation: '2026-11-03' },
      { type: 'parasite', cultureCode: 'voatabia', dateObservation: '2026-11-05' },
      { type: 'parasite', cultureCode: null, dateObservation: '2026-11-04' },
      { type: 'parasite', cultureCode: 'vary', dateObservation: '2026-10-01' }, // trop ancien
    ]
    const resultat = alertes(null, observations)
    expect(resultat.map((a) => a.id)).toEqual(['parasite-tous', 'parasite-voatabia'])
    expect(resultat.find((a) => a.id === 'parasite-voatabia').date).toBe('2026-11-05')
  })

  test('le danger passe toujours en premier', () => {
    const observations = [{ type: 'parasite', cultureCode: 'vary', dateObservation: '2026-11-05' }]
    const resultat = alertes(semaine({ 5: { pluie: 80 } }), observations)
    expect(resultat[0].niveau).toBe('danger')
  })
})

describe('bon moment pour traiter', () => {
  const heures = Array.from({ length: 24 }, (_, i) => ({
    heure: `2026-11-07T${String(i).padStart(2, '0')}:00`,
    temperature: 22,
    code: 1,
    pluie: i >= 14 ? 3 : 0,
    probaPluie: i >= 13 ? 80 : 10,
    vent: 8,
    nuit: i < 6 || i > 18,
  }))
  const semis = { idClient: 's', type: 'semis', cultureCode: 'katsaka', dateObservation: '2026-10-20' }

  test('rappel vert quand des cultures sont en cours', () => {
    const alertes = calculerAlertes({ previsions: { jours: [], heures }, observations: [semis], aujourdhui: '2026-11-07', langue: 'fr' })
    expect(alertes.find((a) => a.id === 'traitement')).toMatchObject({ niveau: 'info', titre: 'Bon moment pour traiter', detail: 'De 6 h à 12 h. Pas de pluie, vent faible.' })
  })

  test('pas de rappel sans culture en cours', () => {
    const alertes = calculerAlertes({ previsions: { jours: [], heures }, observations: [], aujourdhui: '2026-11-07' })
    expect(alertes.find((a) => a.id === 'traitement')).toBeUndefined()
  })
})
