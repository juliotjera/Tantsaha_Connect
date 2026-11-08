import { describe, expect, test } from 'vitest'
import { ajouterJours, aujourdhui, formaterDate, jourSemaine, nomJour } from './dates'

describe('dates', () => {
  test('ajouterJours passe les fins de mois et d\'année', () => {
    expect(ajouterJours('2026-11-30', 1)).toBe('2026-12-01')
    expect(ajouterJours('2027-01-01', -1)).toBe('2026-12-31')
    expect(ajouterJours('2028-02-28', 1)).toBe('2028-02-29') // année bissextile
  })

  test('formaterDate en malagasy, année omise si c\'est l\'année en cours', () => {
    const annee = Number(aujourdhui().slice(0, 4))
    expect(formaterDate(`${annee}-11-06`)).toBe('6 Novambra')
    expect(formaterDate(`${annee - 1}-08-15`)).toBe(`15 Aogositra ${annee - 1}`)
  })

  test('nomJour : aujourd\'hui, demain, puis le nom du jour', () => {
    expect(nomJour(aujourdhui())).toBe('Androany')
    expect(nomJour(ajouterJours(aujourdhui(), 1))).toBe('Rahampitso')
    // au-delà de demain : le nom du jour de la semaine (test indépendant de la date du jour)
    const dansCinqJours = ajouterJours(aujourdhui(), 5)
    expect(nomJour(dansCinqJours)).toBe(jourSemaine(dansCinqJours))
    expect(jourSemaine('2026-11-08')).toBe('Alahady') // un dimanche
  })
})
