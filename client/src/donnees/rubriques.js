import { BellRing, CloudSunRain, Info, Lightbulb, NotebookPen, Settings } from 'lucide-react'

// Les 4 rubriques de l'application (accueil, barre de navigation, écrans).
// - Icone : pictogramme vectoriel (identique sur tous les téléphones,
//   contrairement aux émojis qui changent d'un Android à l'autre)
// - nom : en malagasy (langue des utilisateurs) ; nomFr : rapport et tests
// - couleur : le vert de marque pour toutes : la rubrique se reconnaît à son
//   pictogramme et à sa place ; le rouge reste réservé au danger (convention du sujet)
export const rubriques = [
  {
    id: 'meteo',
    chemin: '/meteo',
    Icone: CloudSunRain,
    nom: 'Toetrandro',
    nomFr: 'Météo',
    couleur: '#1f5c37',
  },
  {
    id: 'alertes',
    chemin: '/alertes',
    Icone: BellRing,
    nom: 'Fanairana',
    nomFr: 'Alertes',
    couleur: '#1f5c37',
  },
  {
    id: 'journal',
    chemin: '/journal',
    Icone: NotebookPen,
    nom: 'Rakitsoratra',
    nomFr: 'Journal de culture',
    nomCourtFr: 'Journal', // dans la barre de navigation
    couleur: '#1f5c37',
    // titre de l'en-tête sur les sous-écrans
    sousEcrans: {
      '/journal/vaovao': { nom: 'Hanoratra', nomFr: 'Nouvelle observation' },
      '/journal/tatitra': { nom: 'Tatitra', nomFr: 'Bilan' },
    },
  },
  {
    id: 'conseils',
    chemin: '/conseils',
    Icone: Lightbulb,
    nom: 'Torohevitra',
    nomFr: 'Conseils',
    couleur: '#1f5c37',
  },
]

// Écrans hors navigation principale, avec un en-tête et un bouton de retour
export const pagesAnnexes = [
  { id: 'fikirana', chemin: '/fikirana', Icone: Settings, nom: 'Fikirana', nomFr: 'Paramètres', couleur: '#1f5c37' },
  { id: 'apropos', chemin: '/mombamomba', Icone: Info, nom: 'Mombamomba', nomFr: 'À propos', couleur: '#1f5c37' },
]

// Rubrique (ou écran annexe) de l'adresse en cours : sert au titre de l'en-tête
// et à la couleur de l'écran. undefined sur l'accueil.
export const rubriqueDe = (chemin) =>
  [...rubriques, ...pagesAnnexes].find((r) => chemin === r.chemin || chemin.startsWith(`${r.chemin}/`))
