import { Router } from 'express'
import * as observations from '../controllers/observations.controller.js'
import { requete } from '../db/pool.js'
import { valider } from '../middlewares/valider.js'
import {
  creerObservationSchema,
  idObservationSchema,
  listerObservationsSchema,
  synchronisationSchema,
} from '../validators/observation.schema.js'

// Toutes les routes de l'API, préfixées par /api (voir app.js).
export const routes = Router()

// Santé de l'API et de la base de données
routes.get('/sante', async (req, res) => {
  let base = 'ok'
  try {
    await requete('SELECT 1')
  } catch {
    base = 'indisponible'
  }
  res.status(base === 'ok' ? 200 : 503).json({
    statut: base === 'ok' ? 'ok' : 'degrade',
    base,
    message: "Tongasoa eto amin'ny Tantsaha Connect",
    date: new Date().toISOString(),
  })
})

// Cultures proposées dans le journal
routes.get('/cultures', observations.listerCultures)

// Observations du journal de culture
routes.get('/observations', valider(listerObservationsSchema, 'query'), observations.lister)
routes.post('/observations', valider(creerObservationSchema), observations.creer)
routes.get('/observations/:id', valider(idObservationSchema, 'params'), observations.afficher)
routes.delete('/observations/:id', valider(idObservationSchema, 'params'), observations.supprimer)

// Envoi groupé de ce qui a été fait hors ligne sur le téléphone
routes.post('/synchronisation', valider(synchronisationSchema), observations.synchroniser)
