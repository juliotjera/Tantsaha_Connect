import { describe, expect, test } from 'vitest'
import { ajouterJours } from '../utils/dates'
import { ceMois, douzeMois, lignesAlmanach, saisonDuMois } from './almanach'

describe('almanach', () => {
  test('12 mois à partir du mois en cours, en passant l\'année', () => {
    const mois = douzeMois('2026-11-07')
    expect(mois[0]).toBe('2026-11')
    expect(mois[2]).toBe('2027-01')
    expect(mois).toHaveLength(12)
  })

  test('saisons des Hautes Terres', () => {
    expect(saisonDuMois(11)).toBe('fahavaratra')
    expect(saisonDuMois(3)).toBe('fahavaratra')
    expect(saisonDuMois(7)).toBe('ririnina')
  })

  test('sans semis dans le journal : toutes les cultures, mois de semis du calendrier', () => {
    const { lignes, toutes, saison } = lignesAlmanach([], '2026-11-07')
    expect(toutes).toBe(true)
    expect(lignes).toHaveLength(6)
    expect(saison).toBe('fahavaratra')
    const katsaka = lignes.find((l) => l.code === 'katsaka')
    expect(katsaka.mois.filter((m) => m.semis).map((m) => m.cle)).toEqual(['2026-11', '2026-12'])
  })

  test('culture semée : seule ligne affichée, avec les mois de récolte prévus', () => {
    const aujourdhui = '2026-11-07'
    const semis = { type: 'semis', cultureCode: 'tsaramaso', dateObservation: ajouterJours(aujourdhui, -40) }
    const { lignes, toutes } = lignesAlmanach([semis], aujourdhui)
    expect(toutes).toBe(false)
    expect(lignes.map((l) => l.code)).toEqual(['tsaramaso'])
    // semé le 28 septembre, cycle de 70 à 95 jours : récolte du 7 décembre au 1er janvier
    expect(lignes[0].mois.filter((m) => m.recolte).map((m) => m.cle)).toEqual(['2026-12', '2027-01'])
  })
})

describe('ce mois-ci (vue simple)', () => {
  test('novembre : riz, maïs, manioc et haricot à semer', () => {
    expect(ceMois([], '2026-11-07')).toEqual({ cle: '2026-11', saison: 'fahavaratra', aSemer: ['vary', 'katsaka', 'mangahazo', 'tsaramaso'], recoltes: [] })
  })

  test('septembre : rien à semer', () => {
    expect(ceMois([], '2026-09-10').aSemer).toEqual([])
  })

  test('récoltes : prête maintenant, ou date de début ; une fois par culture', () => {
    const semis = (code, date, id) => ({ idClient: id, type: 'semis', cultureCode: code, dateObservation: date })
    const { recoltes } = ceMois(
      [semis('tsaramaso', '2026-08-24', 'a'), semis('katsaka', '2026-10-08', 'b'), semis('katsaka', '2026-10-20', 'c')],
      '2026-11-07',
    )
    expect(recoltes).toEqual([
      { code: 'tsaramaso', pret: true, date: '2026-11-02' },
      { code: 'katsaka', pret: false, date: '2027-01-26' },
    ])
  })
})
