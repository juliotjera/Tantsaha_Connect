import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSun, Moon, Sun } from 'lucide-react'

// Prévisions météo : Open-Meteo (gratuit, sans clé, données de grands centres
// météorologiques). La réponse est petite (quelques Ko) : peu de crédit internet.
export function adresseMeteo({ lat, lon }) {
  const parametres = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_gusts_10m_max',
      'sunrise',
      'sunset',
    ].join(','),
    // les 24 prochaines heures : prévision heure par heure et fenêtre de traitement
    hourly: 'temperature_2m,weather_code,precipitation,precipitation_probability,wind_speed_10m,is_day',
    forecast_hours: '24',
    timezone: 'auto',
    forecast_days: '7',
  })
  return `https://api.open-meteo.com/v1/forecast?${parametres}`
}

// Réponse brute d'Open-Meteo → forme simple utilisée par l'application
export function lirePrevisions(reponse) {
  const j = reponse.daily
  return {
    actuel: {
      temperature: Math.round(reponse.current.temperature_2m),
      code: reponse.current.weather_code,
      vent: Math.round(reponse.current.wind_speed_10m),
      nuit: reponse.current.is_day === 0,
    },
    jours: j.time.map((date, i) => ({
      date,
      code: j.weather_code[i],
      tmax: Math.round(j.temperature_2m_max[i]),
      tmin: Math.round(j.temperature_2m_min[i]),
      pluie: Math.round((j.precipitation_sum[i] ?? 0) * 10) / 10, // mm
      probaPluie: j.precipitation_probability_max[i] ?? 0, // %
      rafales: Math.round(j.wind_gusts_10m_max[i] ?? 0), // km/h
      lever: j.sunrise?.[i]?.slice(11, 16) ?? null, // « 05:12 », heure locale
      coucher: j.sunset?.[i]?.slice(11, 16) ?? null,
    })),
    // absent des prévisions gardées par une version précédente de l'application
    heures: (reponse.hourly?.time ?? []).map((heure, i) => {
      const h = reponse.hourly
      return {
        heure, // « 2026-11-07T14:00 », heure locale du lieu
        temperature: Math.round(h.temperature_2m[i]),
        code: h.weather_code[i],
        pluie: Math.round((h.precipitation[i] ?? 0) * 10) / 10,
        probaPluie: h.precipitation_probability[i] ?? 0,
        vent: Math.round(h.wind_speed_10m[i] ?? 0),
        nuit: h.is_day[i] === 0,
      }
    }),
  }
}

// Fenêtre de traitement (pulvériser un produit sur les cultures), comme dans les
// applications agricoles (« spray window ») : de jour, sans pluie, vent faible
// (le produit ne s'envole pas), pas trop chaud (il ne s'évapore pas), et sans pluie
// l'heure suivante (elle laverait le produit). Renvoie la plus longue période d'au
// moins 2 heures dans les 24 prochaines heures, ou null.
export const CONDITIONS_TRAITEMENT = { pluieMax: 0.1, probaPluieMax: 30, ventMax: 15, temperatureMax: 30 }

export function fenetreTraitement(heures) {
  const c = CONDITIONS_TRAITEMENT
  const sec = (h) => h.pluie <= c.pluieMax && h.probaPluie <= c.probaPluieMax
  const bonne = (h, i) =>
    !h.nuit && sec(h) && h.vent <= c.ventMax && h.temperature <= c.temperatureMax && (i + 1 >= heures.length || sec(heures[i + 1]))
  let meilleure = null
  let debut = null
  heures.forEach((h, i) => {
    if (bonne(h, i)) debut ??= i
    const finDePeriode = debut !== null && (!bonne(h, i) || i === heures.length - 1)
    if (finDePeriode) {
      const fin = bonne(h, i) ? i : i - 1
      if (fin - debut + 1 >= 2 && (!meilleure || fin - debut > meilleure.fin - meilleure.debut)) meilleure = { debut, fin }
      debut = null
    }
  })
  if (!meilleure) return null
  return {
    debut: heures[meilleure.debut].heure,
    fin: heures[meilleure.fin].heure, // dernière bonne heure (la période finit une heure après)
    indices: [meilleure.debut, meilleure.fin],
  }
}

// Code météo (norme OMM) → pictogramme, couleur et nom (malagasy, français).
// Pas de rouge ici : il est réservé aux alertes de danger.
const TEMPS = [
  { codes: [0], Icone: Sun, couleur: '#d97706', nom: 'Mazava', nomFr: 'Ensoleillé' },
  { codes: [1, 2], Icone: CloudSun, couleur: '#c27c0e', nom: 'Rahona kely', nomFr: 'Peu nuageux' },
  { codes: [3], Icone: Cloud, couleur: '#64748b', nom: 'Rahona', nomFr: 'Nuageux' },
  { codes: [45, 48], Icone: CloudFog, couleur: '#64748b', nom: 'Zavona', nomFr: 'Brouillard' },
  { codes: [51, 53, 55, 56, 57], Icone: CloudDrizzle, couleur: '#1e6fd9', nom: 'Erika', nomFr: 'Bruine' },
  { codes: [61, 63, 66, 80, 81], Icone: CloudRain, couleur: '#1e6fd9', nom: 'Orana', nomFr: 'Pluie' },
  { codes: [65, 67, 82], Icone: CloudRain, couleur: '#1450a3', nom: 'Oram-be', nomFr: 'Forte pluie' },
  { codes: [95, 96, 99], Icone: CloudLightning, couleur: '#2f3f73', nom: 'Oram-baratra', nomFr: 'Orage' },
]

// La nuit, ciel dégagé : lune au lieu du soleil
const NUIT = {
  0: { Icone: Moon, couleur: '#4f5d8a', nom: 'Mazava', nomFr: 'Dégagé' },
  1: { Icone: CloudMoon, couleur: '#4f5d8a', nom: 'Rahona kely', nomFr: 'Peu nuageux' },
  2: { Icone: CloudMoon, couleur: '#4f5d8a', nom: 'Rahona kely', nomFr: 'Peu nuageux' },
}

export function decrireTemps(code, nuit = false) {
  if (nuit && NUIT[code]) return { codes: [code], ...NUIT[code] }
  return TEMPS.find((t) => t.codes.includes(code)) ?? TEMPS[2]
}
