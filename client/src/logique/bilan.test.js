import { expect, test } from 'vitest'
import { bilanParMois } from './bilan'

const obs = (type, dateObservation) => ({ type, dateObservation })

test('6 mois, du plus ancien au mois en cours, y compris en changeant d\'année', () => {
  const { mois } = bilanParMois([], '2027-02-10')
  expect(mois).toEqual(['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02'])
})

test('comptage par type et par mois, observations trop anciennes ignorées', () => {
  const bilan = bilanParMois(
    [
      obs('semis', '2026-11-03'),
      obs('semis', '2026-11-20'),
      obs('pluie', '2026-10-01'),
      obs('parasite', '2026-11-05'),
      obs('semis', '2026-01-15'), // plus de 6 mois avant
    ],
    '2026-11-25',
  )
  expect(bilan.parType.semis).toEqual([0, 0, 0, 0, 0, 2])
  expect(bilan.parType.pluie).toEqual([0, 0, 0, 0, 1, 0])
  expect(bilan.totaux).toEqual({ semis: 2, recolte: 0, pluie: 1, parasite: 1 })
  expect(bilan.total).toBe(4)
})
