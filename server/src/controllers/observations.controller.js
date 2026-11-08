import * as service from '../services/observations.service.js'

// Couche « contrôleur » : lit la requête HTTP, appelle le service,
// renvoie la réponse avec le bon code HTTP. Aucune logique métier ici.

export async function lister(req, res) {
  res.json(await service.listerObservations(req.valide.query))
}

export async function afficher(req, res) {
  res.json(await service.trouverObservation(req.valide.params.id))
}

export async function creer(req, res) {
  const { observation, nouveau } = await service.creerObservation(req.valide.body)
  // 201 Created pour une nouvelle observation, 200 si elle existait déjà (doublon)
  res.status(nouveau ? 201 : 200).json(observation)
}

export async function supprimer(req, res) {
  await service.supprimerObservation(req.valide.params.id)
  res.status(204).end()
}

export async function synchroniser(req, res) {
  res.json(await service.synchroniser(req.valide.body))
}

export async function listerCultures(req, res) {
  res.json(await service.listerCultures())
}
