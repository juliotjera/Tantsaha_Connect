// Tests de l'API : npm test
// Chaque lancement utilise une base PGlite en mémoire, vide et jetable.
import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'

process.env.DB_MODE = 'memoire'
process.env.DOSSIER_CLIENT = 'aucun-client' // tester l'API seule
const { app } = await import('../src/app.js')
const { fermerBase } = await import('../src/db/pool.js')

let serveur
let adresse

before(async () => {
  serveur = app.listen(0) // port libre choisi par le système
  await new Promise((ok) => serveur.once('listening', ok))
  adresse = `http://localhost:${serveur.address().port}/api`
})

after(async () => {
  serveur.close()
  await fermerBase()
})

const appeler = async (chemin, options = {}) => {
  const reponse = await fetch(adresse + chemin, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    body: options.body && JSON.stringify(options.body),
  })
  const texte = await reponse.text()
  return { statut: reponse.status, corps: texte ? JSON.parse(texte) : null }
}

const hier = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

describe('santé et cultures', () => {
  test('GET /sante : API et base disponibles', async () => {
    const { statut, corps } = await appeler('/sante')
    assert.equal(statut, 200)
    assert.equal(corps.base, 'ok')
  })

  test('GET /cultures : les 6 cultures de départ', async () => {
    const { corps } = await appeler('/cultures')
    assert.deepEqual(
      corps.map((c) => c.code),
      ['vary', 'katsaka', 'mangahazo', 'voatabia', 'karaoty', 'tsaramaso'],
    )
  })

  test('route inconnue : 404 en JSON', async () => {
    const { statut, corps } = await appeler('/inexistant')
    assert.equal(statut, 404)
    assert.equal(corps.erreur, 'Route introuvable')
  })
})

describe('observations', () => {
  test('création, lecture, puis suppression', async () => {
    const creation = await appeler('/observations', {
      method: 'POST',
      body: { type: 'semis', cultureCode: 'vary', dateObservation: hier, idClient: 'test-1' },
    })
    assert.equal(creation.statut, 201)
    assert.equal(creation.corps.cultureCode, 'vary')
    assert.equal(creation.corps.dateObservation, hier)

    const lecture = await appeler(`/observations/${creation.corps.id}`)
    assert.equal(lecture.statut, 200)

    const suppression = await appeler(`/observations/${creation.corps.id}`, { method: 'DELETE' })
    assert.equal(suppression.statut, 204)
    assert.equal((await appeler(`/observations/${creation.corps.id}`)).statut, 404)
  })

  test('même idClient envoyé deux fois : pas de doublon (200)', async () => {
    const observation = { type: 'pluie', dateObservation: hier, idClient: 'test-doublon' }
    const premier = await appeler('/observations', { method: 'POST', body: observation })
    const second = await appeler('/observations', { method: 'POST', body: observation })
    assert.equal(premier.statut, 201)
    assert.equal(second.statut, 200)
    assert.equal(second.corps.id, premier.corps.id)
  })

  test('validation : semis sans culture, date future, culture inconnue', async () => {
    const sansCulture = await appeler('/observations', { method: 'POST', body: { type: 'semis', dateObservation: hier } })
    assert.equal(sansCulture.statut, 400)

    const futur = await appeler('/observations', { method: 'POST', body: { type: 'pluie', dateObservation: '2999-01-01' } })
    assert.equal(futur.statut, 400)

    const inconnue = await appeler('/observations', {
      method: 'POST',
      body: { type: 'parasite', cultureCode: 'banane', dateObservation: hier },
    })
    assert.equal(inconnue.statut, 400)
  })

  test('récolte : acceptée avec une culture, refusée sans', async () => {
    const avec = await appeler('/observations', {
      method: 'POST',
      body: { type: 'recolte', cultureCode: 'katsaka', dateObservation: hier },
    })
    assert.equal(avec.statut, 201)
    const sans = await appeler('/observations', { method: 'POST', body: { type: 'recolte', dateObservation: hier } })
    assert.equal(sans.statut, 400)
  })

  test('la base refuse aussi un type inconnu (contrainte SQL)', async () => {
    const { requete } = await import('../src/db/pool.js')
    await assert.rejects(
      requete("INSERT INTO observations (type, date_observation) VALUES ('inondation', CURRENT_DATE)"),
      /observations_type_check/,
    )
  })

  test('liste paginée et filtrée par type', async () => {
    const { corps } = await appeler('/observations?type=pluie&limite=5')
    assert.ok(corps.total >= 1)
    assert.ok(corps.donnees.every((o) => o.type === 'pluie'))
    assert.equal(corps.limite, 5)
  })

  test('JSON mal formé : 400', async () => {
    const reponse = await fetch(`${adresse}/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ pas du json',
    })
    assert.equal(reponse.status, 400)
  })
})

describe('synchronisation', () => {
  test('enregistre les valides, rejette les invalides sans bloquer les autres', async () => {
    const { statut, corps } = await appeler('/synchronisation', {
      method: 'POST',
      body: {
        creations: [
          { idClient: 'sync-1', type: 'parasite', cultureCode: 'voatabia', dateObservation: hier },
          { idClient: 'sync-2', type: 'semis', dateObservation: hier }, // semis sans culture
        ],
      },
    })
    assert.equal(statut, 200)
    assert.deepEqual(corps.enregistres, ['sync-1'])
    assert.equal(corps.rejetes[0].idClient, 'sync-2')
  })

  test('culture et note à null (pluie, fichier de sauvegarde) : acceptées', async () => {
    const { corps } = await appeler('/synchronisation', {
      method: 'POST',
      body: { creations: [{ idClient: 'sync-null', type: 'pluie', cultureCode: null, note: null, dateObservation: hier }] },
    })
    assert.deepEqual(corps.enregistres, ['sync-null'])
  })

  test('rejouer le même envoi ne crée pas de doublon', async () => {
    const envoi = { creations: [{ idClient: 'sync-3', type: 'pluie', dateObservation: hier }] }
    await appeler('/synchronisation', { method: 'POST', body: envoi })
    await appeler('/synchronisation', { method: 'POST', body: envoi })
    const { corps } = await appeler('/observations?limite=100')
    assert.equal(corps.donnees.filter((o) => o.idClient === 'sync-3').length, 1)
  })

  test('suppressions par idClient, même déjà absentes', async () => {
    const { statut, corps } = await appeler('/synchronisation', {
      method: 'POST',
      body: { suppressions: ['sync-1', 'jamais-envoye'] },
    })
    assert.equal(statut, 200)
    assert.deepEqual(corps.supprimes, ['sync-1', 'jamais-envoye'])
    const liste = await appeler('/observations?limite=100')
    assert.ok(!liste.corps.donnees.some((o) => o.idClient === 'sync-1'))
  })

  test('enveloppe invalide : 400', async () => {
    const { statut } = await appeler('/synchronisation', { method: 'POST', body: { creations: 'pas une liste' } })
    assert.equal(statut, 400)
  })
})
