import { describe, expect, test } from 'vitest'
import { ajouterJours } from '../utils/dates'
import { calculerAlertes } from './alertes'
import { semisDeSaison, volyEnCours } from './voly'

const AUJOURDHUI = '2026-11-06'
const ilYa = (jours) => ajouterJours(AUJOURDHUI, -jours)
const semis = (cultureCode, jours, idClient = `${cultureCode}-${jours}`) => ({
  idClient,
  type: 'semis',
  cultureCode,
  dateObservation: ilYa(jours),
})
const recolte = (cultureCode, jours) => ({ idClient: `r-${cultureCode}-${jours}`, type: 'recolte', cultureCode, dateObservation: ilYa(jours) })

describe('suivi des cultures (Ny voliko)', () => {
  test('semis récent : en croissance, date de récolte prévue', () => {
    const [voly] = volyEnCours([semis('katsaka', 30)], AUJOURDHUI)
    // cycle du maïs : 110 à 150 jours (calendrier officiel des Hautes Terres)
    expect(voly).toMatchObject({ cultureCode: 'katsaka', jours: 30, etat: 'croissance', debutRecolte: ajouterJours(ilYa(30), 110) })
    expect(voly.progression).toBeCloseTo(30 / 110)
  })

  test('cycle atteint : récolte possible, puis en retard', () => {
    expect(volyEnCours([semis('tsaramaso', 75)], AUJOURDHUI)[0].etat).toBe('recolte')
    expect(volyEnCours([semis('tsaramaso', 100)], AUJOURDHUI)[0].etat).toBe('retard')
  })

  test('une récolte clôt le semis : plus de culture en cours', () => {
    expect(volyEnCours([semis('vary', 140), recolte('vary', 2)], AUJOURDHUI)).toEqual([])
  })

  test('deux parcelles, une récolte : seule la plus ancienne est close', () => {
    const enCours = volyEnCours([semis('vary', 140, 'a'), semis('vary', 20, 'b'), recolte('vary', 1)], AUJOURDHUI)
    expect(enCours.map((v) => v.semis.idClient)).toEqual(['b'])
  })

  test('semis très ancien, jamais récolté : considéré terminé', () => {
    expect(volyEnCours([semis('katsaka', 400)], AUJOURDHUI)).toEqual([])
  })

  test('pluie et parasite ne sont pas des cultures', () => {
    expect(volyEnCours([{ type: 'pluie', dateObservation: ilYa(3) }], AUJOURDHUI)).toEqual([])
  })

  test('saison des semis : seulement les cultures déjà pratiquées et pas en cours', () => {
    // novembre : saison du maïs et du riz, pas de la tomate
    const historique = [semis('katsaka', 380), semis('voatabia', 200), semis('vary', 30)]
    expect(semisDeSaison(historique, AUJOURDHUI)).toEqual(['katsaka'])
  })
})

describe('alertes du calendrier', () => {
  const semaine = (pluie) => ({
    jours: Array.from({ length: 7 }, (_, i) => ({ date: ajouterJours(AUJOURDHUI, i), code: 3, tmax: 27, tmin: 15, pluie, probaPluie: 50, rafales: 20 })),
  })

  test('récolte prête par temps sec : rappel vert', () => {
    const [alerte] = calculerAlertes({ previsions: semaine(0), observations: [semis('tsaramaso', 75)], aujourdhui: AUJOURDHUI })
    expect(alerte).toMatchObject({ id: 'recolte-tsaramaso', niveau: 'info', titre: 'Efa azo jinjaina', conseil: 'fijinjana' })
  })

  test('récolte prête et pluie dans 3 jours : vigilance, récolter avant', () => {
    const alertes = calculerAlertes({ previsions: semaine(8), observations: [semis('tsaramaso', 75)], aujourdhui: AUJOURDHUI })
    expect(alertes.find((a) => a.id === 'recolte-tsaramaso')).toMatchObject({ niveau: 'vigilance', titre: "Jinjao alohan'ny orana" })
  })

  test('saison des semis : rappel vert pour une culture déjà pratiquée', () => {
    const alertes = calculerAlertes({ previsions: null, observations: [semis('katsaka', 380)], aujourdhui: AUJOURDHUI })
    expect(alertes).toMatchObject([{ id: 'semis-katsaka', niveau: 'info', titre: 'Fotoana famafazana' }])
  })

  test('ordre : danger, vigilance, puis rappels', () => {
    const previsions = semaine(1)
    previsions.jours[2].pluie = 70
    const observations = [semis('katsaka', 380), { type: 'parasite', cultureCode: 'vary', dateObservation: ilYa(1) }]
    const niveaux = calculerAlertes({ previsions, observations, aujourdhui: AUJOURDHUI }).map((a) => a.niveau)
    expect(niveaux).toEqual(['danger', 'vigilance', 'info'])
  })
})
