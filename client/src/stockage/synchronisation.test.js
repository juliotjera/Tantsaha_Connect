import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ajouterObservation, listerObservations, lireEnAttente, supprimerObservation } from './journal'
import { synchroniser } from './synchronisation'

// Simule l'API : enregistre tout, sauf les semis sans culture (refusés)
function apiFictive() {
  return vi.fn(async (url, { body }) => {
    const { creations, suppressions } = JSON.parse(body)
    const valides = creations.filter((c) => c.type !== 'semis' || c.cultureCode)
    return new Response(
      JSON.stringify({
        enregistres: valides.map((c) => c.idClient),
        rejetes: creations.filter((c) => !valides.includes(c)).map((c) => ({ idClient: c.idClient, erreur: 'invalide' })),
        supprimes: suppressions,
      }),
      { status: 200 },
    )
  })
}

let enLigne = true
beforeEach(() => {
  enLigne = true
  vi.stubGlobal('navigator', { get onLine() { return enLigne } })
})
afterEach(async () => {
  vi.unstubAllGlobals()
  for (const o of await listerObservations()) await supprimerObservation(o.idClient)
  // vide aussi les suppressions en attente
  vi.stubGlobal('navigator', { onLine: true })
  vi.stubGlobal('fetch', apiFictive())
  await synchroniser()
  vi.unstubAllGlobals()
})

describe('journal local', () => {
  test('ajout puis liste, la plus récente en premier', async () => {
    await ajouterObservation({ type: 'pluie', dateObservation: '2026-11-01' })
    await ajouterObservation({ type: 'semis', cultureCode: 'vary', dateObservation: '2026-11-05' })
    const liste = await listerObservations()
    expect(liste.map((o) => o.dateObservation)).toEqual(['2026-11-05', '2026-11-01'])
    expect(liste.every((o) => o.synchronise === false && o.idClient)).toBe(true)
  })

  test('une suppression est gardée pour être envoyée au serveur', async () => {
    const o = await ajouterObservation({ type: 'pluie', dateObservation: '2026-11-01' })
    await supprimerObservation(o.idClient)
    const { creations, suppressions } = await lireEnAttente()
    expect(creations).toHaveLength(0)
    expect(suppressions).toContain(o.idClient)
  })
})

describe('synchronisation', () => {
  test('hors ligne : rien n\'est envoyé, rien n\'est perdu', async () => {
    enLigne = false
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await ajouterObservation({ type: 'pluie', dateObservation: '2026-11-02' })
    expect(await synchroniser()).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
    expect((await lireEnAttente()).creations).toHaveLength(1)
  })

  test('en ligne : envoyées puis marquées, les refusées ne sont plus renvoyées', async () => {
    const api = apiFictive()
    vi.stubGlobal('fetch', api)
    const bonne = await ajouterObservation({ type: 'parasite', cultureCode: 'voatabia', dateObservation: '2026-11-03' })
    await ajouterObservation({ type: 'semis', dateObservation: '2026-11-03' }) // invalide

    expect(await synchroniser()).toBe(true)
    const envoi = JSON.parse(api.mock.calls[0][1].body)
    expect(envoi.creations).toHaveLength(2)
    expect(envoi.creations[0]).not.toHaveProperty('note') // champs vides non envoyés

    const liste = await listerObservations()
    expect(liste.find((o) => o.idClient === bonne.idClient).synchronise).toBe(true)
    expect((await lireEnAttente()).creations).toHaveLength(0)
  })

  test('serveur indisponible : tout reste en attente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await ajouterObservation({ type: 'pluie', dateObservation: '2026-11-04' })
    expect(await synchroniser()).toBe(false)
    expect((await lireEnAttente()).creations).toHaveLength(1)
  })

  test('deux appels simultanés : un seul envoi', async () => {
    const api = apiFictive()
    vi.stubGlobal('fetch', api)
    await ajouterObservation({ type: 'pluie', dateObservation: '2026-11-04' })
    await Promise.all([synchroniser(), synchroniser()])
    expect(api).toHaveBeenCalledTimes(1)
  })
})
