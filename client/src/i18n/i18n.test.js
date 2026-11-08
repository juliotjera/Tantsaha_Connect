import { describe, expect, test } from 'vitest'
import { cultures } from '../donnees/cultures'
import { conseils } from '../donnees/conseils'
import { calculerAlertes } from '../logique/alertes'
import { ajouterJours, formaterDate, jourSemaine } from '../utils/dates'
import { nomDans, nomLieu, traduire } from './index'
import { textes } from './textes'

describe('bilinguisme', () => {
  test('chaque texte existe en malagasy et en français, avec les mêmes valeurs à insérer', () => {
    for (const [cle, { mg, fr }] of Object.entries(textes)) {
      expect(mg, cle).toBeTruthy()
      expect(fr, cle).toBeTruthy()
      const variables = (t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
      expect(variables(fr), cle).toEqual(variables(mg))
    }
  })

  test('traduction avec valeurs, et clé inconnue renvoyée telle quelle', () => {
    expect(traduire('fr', 'journal.jour', { n: 3 })).toBe('jour 3')
    expect(traduire('mg', 'journal.jour', { n: 3 })).toBe('andro 3')
    expect(traduire('fr', 'cle.inconnue')).toBe('cle.inconnue')
  })

  test('noms des cultures et lieux GPS', () => {
    const mais = cultures.find((c) => c.code === 'katsaka')
    expect(nomDans('mg', mais)).toBe('Katsaka')
    expect(nomDans('fr', mais)).toBe('Maïs')
    expect(nomLieu('fr', { nom: 'Antsirabe', pres: 'Antsirabe' })).toBe('Près de Antsirabe')
    expect(nomLieu('mg', { nom: 'Antsirabe' })).toBe('Antsirabe')
  })

  test('dates en français', () => {
    expect(formaterDate('2026-11-06', 'fr').startsWith('6 novembre')).toBe(true)
    expect(jourSemaine('2026-11-08', 'fr')).toBe('Dimanche')
  })

  test('chaque conseil a sa version française', () => {
    for (const c of conseils) {
      expect(c.titreFr, c.id).toBeTruthy()
      expect(c.texteFr, c.id).toBeTruthy()
    }
  })

  test('alertes en français', () => {
    const aujourdhui = '2026-11-06'
    const previsions = {
      jours: Array.from({ length: 7 }, (_, i) => ({ date: ajouterJours(aujourdhui, i), code: 3, tmax: 27, tmin: 15, pluie: i === 1 ? 60 : 0, probaPluie: 50, rafales: 20 })),
    }
    const [alerte] = calculerAlertes({ previsions, observations: [], aujourdhui, langue: 'fr' })
    expect(alerte.titre).toBe('Pluie très forte')
    expect(alerte.detail).toContain("Risque d'inondation")
  })
})
