// Nombres à la façon malagasy et française : virgule décimale (30,3), une décimale au plus
const FORMAT = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export const formaterNombre = (n) => FORMAT.format(n)

// « 30,3 mm » : espace insécable entre le nombre et l'unité (jamais coupés en fin de ligne)
export const millimetres = (n) => `${formaterNombre(n)}\u00a0mm`
