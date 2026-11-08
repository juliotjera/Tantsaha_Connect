import { Bug, CloudRain, ShoppingBasket, Sprout } from 'lucide-react'

// Les 4 types d'observation du journal (mêmes codes que l'API).
// - culture : 'obligatoire' (un semis, une récolte concernent toujours une culture),
//   'facultative' (un parasite touche souvent une culture), ou 'aucune' (la pluie)
// - le rouge du parasite signale un danger (convention culturelle du sujet)
export const typesObservation = [
  { code: 'semis', nom: 'Famafazana', nomFr: 'Semis / plantation', Icone: Sprout, couleur: '#2e7d32', culture: 'obligatoire' },
  { code: 'recolte', nom: 'Fijinjana', nomFr: 'Récolte', Icone: ShoppingBasket, couleur: '#a16207', culture: 'obligatoire' },
  { code: 'pluie', nom: 'Orana', nomFr: 'Pluie', Icone: CloudRain, couleur: '#1a5fc0', culture: 'aucune' },
  { code: 'parasite', nom: 'Bibikely', nomFr: 'Parasite', Icone: Bug, couleur: '#9a5a12', culture: 'facultative' },
]

export const trouverType = (code) => typesObservation.find((t) => t.code === code)
