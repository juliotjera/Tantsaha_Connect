import { Bug, CloudRain, ShoppingBasket, Sprout, Sun, Wind } from 'lucide-react'
import { cultures } from './cultures'

// Conseils agricoles, en malagasy simple (et en français). Chaque conseil a un message vocal malagasy
// (public/audio/<audio>.mp3, voir docs/voix-malagasy.md).
// À faire relire par un technicien agricole et un locuteur natif avant diffusion.

const culture = (code) => cultures.find((c) => c.code === code)

export const conseils = [
  // --- selon le temps (liés aux alertes) ---
  {
    id: 'orana-mahery',
    titreFr: 'Avant une forte pluie',
    texteFr: "Nettoyez les canaux d'écoulement pour que l'eau ne stagne pas dans le champ. Ne semez pas et ne mettez pas d'engrais si une forte pluie arrive.",
    theme: 'toetrandro',
    Icone: CloudRain,
    couleur: '#1a5fc0',
    titre: 'Rehefa ho avy ny orana mahery',
    texte: "Diovy ny lakan-drano mba tsy hiandrona ny rano ao amin'ny tanimboly. Aza mamafy na manisy zezika raha mbola hilatsaka ny orana be.",
  },
  {
    id: 'rivotra',
    titreFr: 'En cas de vent fort',
    texteFr: 'Tuteurez les tomates et les plantes hautes. Posez des pierres sur le toit du grenier.',
    theme: 'toetrandro',
    Icone: Wind,
    couleur: '#475569',
    titre: 'Rehefa misy rivotra mahery',
    texte: "Asio tsatoka ny voatabia sy ny zavamaniry lava. Ampio vato ny tafon'ny trano fitehirizana.",
  },
  {
    id: 'haintany',
    titreFr: 'Quand il ne pleut pas',
    texteFr: "Paillez le pied des plantes avec de la paille ou de l'herbe sèche pour garder l'humidité. Arrosez le matin ou le soir.",
    theme: 'toetrandro',
    Icone: Sun,
    couleur: '#d97706',
    titre: 'Rehefa tsy misy orana',
    texte: "Asio mololo na ahitra maina ny fototry ny voly mba hitazonana ny hamandoana. Tondrahy amin'ny maraina na amin'ny hariva ny voly.",
  },
  {
    id: 'bibikely',
    titreFr: 'En cas de parasites',
    texteFr: "Retirez et brûlez les feuilles malades. Surveillez chaque jour les cultures voisines. Demandez conseil à un technicien avant d'utiliser un produit.",
    theme: 'toetrandro',
    Icone: Bug,
    couleur: '#9a5a12', // ocre : à surveiller (le rouge reste réservé au danger)
    titre: 'Rehefa misy bibikely',
    texte: "Esory ary doroy ny ravina marary. Jereo isan'andro ny voly manodidina. Manontania amin'ny teknisianina alohan'ny hampiasana fanafody.",
  },

  // --- calendrier : semer et récolter (liés aux rappels) ---
  {
    id: 'famafazana',
    titreFr: 'Pour semer',
    texteFr: 'Semez quand la terre est bien humide, après les premières pluies. Choisissez des semences saines. Notez la date du semis dans le journal.',
    theme: 'fotoana',
    Icone: Sprout,
    couleur: '#2e7d32',
    titre: 'Rehefa hamafy',
    texte: "Mamafy rehefa lena tsara ny tany, aorian'ny orana voalohany. Mifidiana voa salama sy tsara. Soraty ao amin'ny rakitsoratra ny andro namafazana.",
  },
  {
    id: 'fijinjana',
    titreFr: 'Pour récolter',
    texteFr: "Récoltez par temps sec. Séchez bien la récolte avant de la stocker, pour qu'elle ne pourrisse pas. Conservez-la dans un endroit sec et aéré.",
    theme: 'fotoana',
    Icone: ShoppingBasket,
    couleur: '#a16207',
    titre: 'Rehefa hijinja',
    texte: "Mijinja rehefa maina ny andro. Ahahy tsara ny vokatra alohan'ny hitehirizana azy mba tsy ho lo. Tehirizo any amin'ny toerana maina sy misy rivotra.",
  },

  // --- par culture ---
  {
    id: 'vary',
    titreFr: 'Culture du riz',
    texteFr: 'Repiquez les plants jeunes, entre 8 et 15 jours. Laissez 25 centimètres entre chaque pied.',
    cultureCode: 'vary',
    titre: 'Fambolena vary',
    texte: "Afindrao ny ketsa raha mbola tanora, eo amin'ny 8 ka hatramin'ny 15 andro. Asio elanelana 25 santimetatra ny fototra tsirairay.",
  },
  {
    id: 'katsaka',
    titreFr: 'Culture du maïs',
    texteFr: 'Semez le maïs au début des pluies. Laissez 80 centimètres entre les rangs et 40 centimètres entre les pieds.',
    cultureCode: 'katsaka',
    titre: 'Fambolena katsaka',
    texte: "Mamafy katsaka rehefa manomboka ny orana. Asio elanelana 80 santimetatra ny andalana, ary 40 santimetatra ny fototra.",
  },
  {
    id: 'mangahazo',
    titreFr: 'Culture du manioc',
    texteFr: 'Coupez des boutures de 20 centimètres environ et plantez-les inclinées. La récolte est possible après 9 à 12 mois.',
    cultureCode: 'mangahazo',
    titre: 'Fambolena mangahazo',
    texte: "Tapaho 20 santimetatra eo ho eo ny taho-mangahazo, ary atsatoka mitongilana. Azo jinjaina aorian'ny 9 ka hatramin'ny 12 volana.",
  },
  {
    id: 'voatabia',
    titreFr: 'Culture de la tomate',
    texteFr: 'Tuteurez les tomates. Arrosez seulement au pied, sans mouiller les feuilles, pour éviter les maladies.',
    cultureCode: 'voatabia',
    titre: 'Fambolena voatabia',
    texte: "Asio tsatoka ny voatabia. Rehefa manondraka, tondrahy eo am-pototra ihany fa aza atao lena ny ravina, mba tsy ho voan'ny aretina.",
  },
  {
    id: 'karaoty',
    titreFr: 'Culture de la carotte',
    texteFr: 'Semez les carottes dans une terre meuble et sans cailloux. Après la levée, éclaircissez pour laisser 5 centimètres entre les plants.',
    cultureCode: 'karaoty',
    titre: 'Fambolena karaoty',
    texte: "Mamafy karaoty amin'ny tany malemy tsy misy vato. Rehefa maniry, esory ny sasany mba hisy elanelana 5 santimetatra.",
  },
  {
    id: 'tsaramaso',
    titreFr: 'Culture du haricot',
    texteFr: "Semez les haricots quand la terre est humide. Le haricot demande peu d'engrais azoté : il enrichit le sol pour la culture suivante.",
    cultureCode: 'tsaramaso',
    titre: 'Fambolena tsaramaso',
    texte: "Mamafy tsaramaso rehefa lena ny tany. Tsy mila zezika azota be ny tsaramaso, fa izy no manatsara ny tany ho an'ny voly manaraka.",
  },
].map((c) => {
  const cult = c.cultureCode && culture(c.cultureCode)
  return {
    ...c,
    Icone: c.Icone ?? cult.Icone,
    couleur: c.couleur ?? cult.couleur,
    photo: cult?.photo, // les fiches d'une culture montrent sa photo
    audio: `torohevitra-${c.id}`,
  }
})
