// Chefs-lieux des régions de Madagascar (coordonnées approximatives),
// pour choisir son lieu sans GPS. Les chefs-lieux des Hautes Terres (Analamanga,
// Vakinankaratra, Itasy, Bongolava, Amoron'i Mania, Haute Matsiatra) sont proposés en premier. Les prévisions couvrent une zone d'environ
// 10 km : la ville la plus proche suffit.
export const lieux = [
  { id: 'antananarivo', nom: 'Antananarivo', lat: -18.914, lon: 47.536, hautesTerres: true },
  { id: 'antsirabe', nom: 'Antsirabe', lat: -19.866, lon: 47.033, hautesTerres: true },
  { id: 'ambatondrazaka', nom: 'Ambatondrazaka', lat: -17.833, lon: 48.417 },
  { id: 'ambositra', nom: 'Ambositra', lat: -20.531, lon: 47.245, hautesTerres: true },
  { id: 'ambovombe', nom: 'Ambovombe', lat: -25.167, lon: 46.083 },
  { id: 'antsiranana', nom: 'Antsiranana', lat: -12.279, lon: 49.292 },
  { id: 'antsohihy', nom: 'Antsohihy', lat: -14.88, lon: 47.988 },
  { id: 'farafangana', nom: 'Farafangana', lat: -22.817, lon: 47.833 },
  { id: 'fenoarivo', nom: 'Fenoarivo Atsinanana', lat: -17.383, lon: 49.417 },
  { id: 'fianarantsoa', nom: 'Fianarantsoa', lat: -21.453, lon: 47.086, hautesTerres: true },
  { id: 'ihosy', nom: 'Ihosy', lat: -22.4, lon: 46.117 },
  { id: 'maevatanana', nom: 'Maevatanana', lat: -16.95, lon: 46.833 },
  { id: 'mahajanga', nom: 'Mahajanga', lat: -15.717, lon: 46.317 },
  { id: 'maintirano', nom: 'Maintirano', lat: -18.067, lon: 44.017 },
  { id: 'manakara', nom: 'Manakara', lat: -22.15, lon: 48.0 },
  { id: 'mananjary', nom: 'Mananjary', lat: -21.217, lon: 48.333 },
  { id: 'miarinarivo', nom: 'Miarinarivo', lat: -18.96, lon: 46.9, hautesTerres: true },
  { id: 'morondava', nom: 'Morondava', lat: -20.283, lon: 44.283 },
  { id: 'sambava', nom: 'Sambava', lat: -14.267, lon: 50.167 },
  { id: 'taolagnaro', nom: 'Taolagnaro', lat: -25.032, lon: 46.983 },
  { id: 'toamasina', nom: 'Toamasina', lat: -18.149, lon: 49.402 },
  { id: 'toliara', nom: 'Toliara', lat: -23.35, lon: 43.667 },
  { id: 'tsiroanomandidy', nom: 'Tsiroanomandidy', lat: -18.767, lon: 46.05, hautesTerres: true },
]

// Ville la plus proche d'une position GPS (pour afficher un nom connu)
export function lieuLePlusProche(lat, lon) {
  const distance = (l) => (l.lat - lat) ** 2 + ((l.lon - lon) * Math.cos((lat * Math.PI) / 180)) ** 2
  return lieux.reduce((proche, l) => (distance(l) < distance(proche) ? l : proche))
}
