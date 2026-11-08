// Erreur « prévue » de l'API : elle porte le code HTTP à renvoyer.
// Exemple : throw new ErreurApi(404, 'Observation introuvable')
export class ErreurApi extends Error {
  constructor(statut, message, details) {
    super(message)
    this.statut = statut
    this.details = details
  }
}
