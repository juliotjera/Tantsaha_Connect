import { ErreurApi } from '../utils/ErreurApi.js'

// Valide une partie de la requête (body, query ou params) avec un schéma Zod.
// Si les données sont invalides : 400 avec la liste des champs en erreur.
// Si elles sont valides : elles sont remplacées par la version nettoyée.
export const valider = (schema, source = 'body') => (req, res, next) => {
  const resultat = schema.safeParse(req[source])
  if (!resultat.success) {
    const details = resultat.error.issues.map((e) => ({ champ: e.path.join('.'), message: e.message }))
    return next(new ErreurApi(400, 'Données invalides', details))
  }
  req.valide = { ...req.valide, [source]: resultat.data }
  next()
}
