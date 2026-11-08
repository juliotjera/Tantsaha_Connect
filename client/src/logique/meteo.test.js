import { expect, test } from 'vitest'
import { adresseMeteo, decrireTemps, fenetreTraitement, lirePrevisions } from './meteo'

test('adresse Open-Meteo avec le lieu et les données utiles', () => {
  const url = new URL(adresseMeteo({ lat: -18.91, lon: 47.54 }))
  expect(url.searchParams.get('latitude')).toBe('-18.91')
  expect(url.searchParams.get('daily')).toContain('precipitation_sum')
  expect(url.searchParams.get('timezone')).toBe('auto')
})

test('lecture de la réponse : valeurs arrondies, pluie absente = 0', () => {
  const previsions = lirePrevisions({
    current: { temperature_2m: 24.6, weather_code: 61, wind_speed_10m: 11.2, is_day: 1 },
    daily: {
      time: ['2026-11-06'],
      weather_code: [63],
      temperature_2m_max: [27.4],
      temperature_2m_min: [15.5],
      precipitation_sum: [null],
      precipitation_probability_max: [80],
      wind_gusts_10m_max: [41.7],
    },
  })
  expect(previsions.actuel).toEqual({ temperature: 25, code: 61, vent: 11, nuit: false })
  expect(previsions.jours[0]).toMatchObject({ tmax: 27, tmin: 16, pluie: 0, probaPluie: 80, rafales: 42 })
})

test('codes météo : nom malagasy, code inconnu = nuageux', () => {
  expect(decrireTemps(0).nom).toBe('Mazava')
  expect(decrireTemps(95).nom).toBe('Oram-baratra')
  expect(decrireTemps(12345).nom).toBe('Rahona')
})

test('la nuit, ciel dégagé : même nom, autre pictogramme', () => {
  expect(decrireTemps(0, true).nom).toBe('Mazava')
  expect(decrireTemps(0, true).Icone).not.toBe(decrireTemps(0).Icone)
  expect(decrireTemps(61, true)).toBe(decrireTemps(61)) // la pluie reste la pluie
})

// une journée : nuit jusqu'à 6 h, beau temps de 7 h à 11 h, vent fort à midi, pluie à 15 h
const journee = () =>
  Array.from({ length: 24 }, (_, h) => ({
    heure: `2026-11-07T${String(h).padStart(2, '0')}:00`,
    temperature: 22,
    code: 1,
    pluie: h === 15 ? 4 : 0,
    probaPluie: h === 15 ? 80 : 10,
    vent: h === 12 ? 25 : 8,
    nuit: h < 6 || h > 18,
  }))

test('heures : lues depuis la réponse, absentes des anciennes prévisions', () => {
  const sansHeures = lirePrevisions({
    current: { temperature_2m: 20, weather_code: 0, wind_speed_10m: 3, is_day: 1 },
    daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_gusts_10m_max: [] },
  })
  expect(sansHeures.heures).toEqual([])
  const avec = lirePrevisions({
    ...{ current: { temperature_2m: 20, weather_code: 0, wind_speed_10m: 3, is_day: 1 } },
    daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_gusts_10m_max: [] },
    hourly: { time: ['2026-11-07T14:00'], temperature_2m: [23.6], weather_code: [2], precipitation: [null], precipitation_probability: [20], wind_speed_10m: [9.4], is_day: [1] },
  })
  expect(avec.heures[0]).toEqual({ heure: '2026-11-07T14:00', temperature: 24, code: 2, pluie: 0, probaPluie: 20, vent: 9, nuit: false })
})

test('fenêtre de traitement : la plus longue période de jour, sèche et sans vent fort', () => {
  // 6 h à 11 h (midi : vent fort) ; 13 h (14 h précède la pluie de 15 h) : trop court
  expect(fenetreTraitement(journee())).toMatchObject({ debut: '2026-11-07T06:00', fin: '2026-11-07T11:00' })
})

test('fenêtre de traitement : aucune si la pluie ou le vent durent toute la journée', () => {
  expect(fenetreTraitement(journee().map((h) => ({ ...h, vent: 30 })))).toBeNull()
  expect(fenetreTraitement([])).toBeNull()
})
