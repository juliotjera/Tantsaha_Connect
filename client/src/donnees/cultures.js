import { Bean, Carrot, Wheat } from 'lucide-react'
import { Mais, Manioc, Tomate } from '../components/IconesCultures'
import { photos } from './photos'

// Cultures proposées dans le journal. Les codes sont les mêmes que dans la
// base de données (server/src/db/schema.sql) : la liste reste disponible
// hors ligne, sans avoir besoin de la demander à l'API.
// - photo : grande vignette (choix de la culture, suivi) ; Icone : petits espaces
export const cultures = [
  { code: 'vary', nom: 'Vary', nomFr: 'Riz', Icone: Wheat, couleur: '#b8860b' },
  { code: 'katsaka', nom: 'Katsaka', nomFr: 'Maïs', Icone: Mais, couleur: '#c99700' },
  { code: 'mangahazo', nom: 'Mangahazo', nomFr: 'Manioc', Icone: Manioc, couleur: '#8a5a2b' },
  { code: 'voatabia', nom: 'Voatabia', nomFr: 'Tomate', Icone: Tomate, couleur: '#c2410c' },
  { code: 'karaoty', nom: 'Karaoty', nomFr: 'Carotte', Icone: Carrot, couleur: '#ea7a12' },
  { code: 'tsaramaso', nom: 'Tsaramaso', nomFr: 'Haricot', Icone: Bean, couleur: '#4d7c0f' },
].map((culture) => ({ ...culture, photo: photos[culture.code].src }))

export const trouverCulture = (code) => cultures.find((c) => c.code === code)
