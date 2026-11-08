import { afterEach, expect, test } from 'vitest'
import { ajouterObservation, listerObservations, supprimerObservation } from './journal'
import { fichierSauvegarde, importerSauvegarde } from './sauvegarde'

afterEach(async () => {
  for (const o of await listerObservations()) await supprimerObservation(o.idClient)
})

test('sauvegarde : le fichier exporté se réimporte sur un autre téléphone', async () => {
  const semis = await ajouterObservation({ type: 'semis', cultureCode: 'vary', dateObservation: '2026-11-02' })
  const fichier = await fichierSauvegarde('2026-11-07')
  expect(fichier.name).toBe('tantsaha-rakitsoratra-2026-11-07.json')

  // « autre téléphone » : le journal est vide
  await supprimerObservation(semis.idClient)
  expect(await importerSauvegarde(fichier)).toBe(1)
  const [retrouvee] = await listerObservations()
  expect(retrouvee).toMatchObject({ idClient: semis.idClient, type: 'semis', cultureCode: 'vary', synchronise: false })

  // déjà présente : rien n'est ajouté deux fois
  expect(await importerSauvegarde(fichier)).toBe(0)
})

test('sauvegarde : fichier inconnu refusé, observations invalides ignorées', async () => {
  const texte = (contenu) => new File([JSON.stringify(contenu)], 'x.json')
  await expect(importerSauvegarde(texte({ observations: [] }))).rejects.toThrow()
  await expect(importerSauvegarde(new File(['pas du JSON'], 'x.json'))).rejects.toThrow()
  const n = await importerSauvegarde(
    texte({
      format: 'tantsaha-connect-journal',
      observations: [
        { idClient: 'a', type: 'pluie', cultureCode: null, dateObservation: '2026-11-01' },
        { idClient: 'b', type: 'inconnu', dateObservation: '2026-11-01' },
        { idClient: 'c', type: 'pluie', dateObservation: 'hier' },
      ],
    }),
  )
  expect(n).toBe(1)
})
