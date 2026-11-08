import { z } from 'zod'

export const TYPES_OBSERVATION = ['semis', 'pluie', 'parasite', 'recolte']

// Date au format AAAA-MM-JJ, et jamais dans le futur.
// Tolérance d'un jour : le téléphone (UTC+3 à Madagascar) peut déjà être
// au lendemain alors que le serveur compte en UTC.
const demain = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const dateObservation = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ')
  .refine((d) => !Number.isNaN(Date.parse(d)), 'Date invalide')
  .refine((d) => d <= demain(), 'La date ne peut pas être dans le futur')

// Création d'une observation (POST /api/observations)
export const creerObservationSchema = z
  .object({
    type: z.enum(TYPES_OBSERVATION),
    cultureCode: z.string().trim().min(1).nullish(), // absent ou null : sans culture (pluie, parasite)
    dateObservation,
    note: z.string().trim().max(500).nullish(),
    idClient: z.string().trim().min(1).max(100).optional(),
  })
  .refine((o) => !['semis', 'recolte'].includes(o.type) || o.cultureCode, {
    message: 'Un semis ou une récolte doit préciser la culture',
    path: ['cultureCode'],
  })

// Filtres et pagination de la liste (GET /api/observations?type=semis&page=1)
export const listerObservationsSchema = z.object({
  type: z.enum(TYPES_OBSERVATION).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
})

export const idObservationSchema = z.object({
  id: z.uuid('Identifiant invalide'),
})

// Synchronisation du téléphone (POST /api/synchronisation) : tout ce qui a été
// saisi ou supprimé hors ligne, envoyé en une fois. Chaque observation est
// vérifiée séparément (voir le service) : une seule observation invalide
// ne doit pas bloquer l'envoi de toutes les autres.
const idClient = z.string().trim().min(1).max(100)
export const synchronisationSchema = z.object({
  creations: z.array(z.looseObject({ idClient })).max(100).default([]),
  suppressions: z.array(idClient).max(100).default([]),
})
