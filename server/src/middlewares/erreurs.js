import { ErreurApi } from '../utils/ErreurApi.js'

// Route inconnue : 404 au format JSON (et non une page HTML).
export function routeIntrouvable(req, res) {
  res.status(404).json({ erreur: 'Route introuvable', chemin: req.originalUrl })
}

// Gestion centralisée des erreurs : toutes les erreurs arrivent ici.
// - ErreurApi : erreur prévue (400, 404…), message renvoyé au client
// - autre : erreur inattendue (500), détail journalisé côté serveur seulement
// eslint-disable-next-line no-unused-vars -- Express reconnaît ce middleware à ses 4 paramètres
export function gestionErreurs(erreur, req, res, next) {
  if (erreur instanceof ErreurApi) {
    return res.status(erreur.statut).json({ erreur: erreur.message, details: erreur.details })
  }
  // JSON mal formé envoyé par le client
  if (erreur.type === 'entity.parse.failed') {
    return res.status(400).json({ erreur: 'Corps de la requête : JSON invalide' })
  }
  if (erreur.type === 'entity.too.large') {
    return res.status(413).json({ erreur: 'Corps de la requête trop volumineux' })
  }
  console.error(erreur)
  res.status(500).json({ erreur: 'Erreur interne du serveur' })
}
