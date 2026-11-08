// Photos de l'application (public/photos), toutes sous licence libre (Wikimedia Commons).
// Les licences CC BY et CC BY-SA demandent de citer l'auteur, la licence et la source,
// et d'indiquer les modifications : affichés sur la page « Mombamomba ».
// Modification commune : recadrage et compression WebP pour l'usage hors ligne ;
// les trois couvertures sont aussi étalonnées de la même façon (une série).
// Les photos adaptées d'un original CC BY-SA restent sous la même licence.

const LICENCES = {
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
}

// description : « malagasy (français) » → séparée selon la langue d'affichage
const photo = (id, description, auteur, licence, source) => ({
  id,
  src: `/photos/${id}.webp`,
  description: description.replace(/ \(.*\)$/, ''),
  descriptionFr: description.match(/\((.*)\)$/)[1].replace(/^./, (c) => c.toUpperCase()),
  auteur,
  licence,
  lienLicence: LICENCES[licence],
  source,
})

export const photos = {
  // couvertures de l'accueil, une par période de l'année agricole
  'couverture-repiquage': photo(
    'couverture-repiquage',
    'Vehivavy manetsa vary eto Madagasikara (repiquage du riz à Madagascar)',
    'Pascale Bireaud',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:R%C3%A9colte_dans_rizi%C3%A8res.jpg',
  ),
  'couverture-recolte': photo(
    'couverture-recolte',
    "Fijinjana vary akaikin'i Ambositra (récolte du riz près d'Ambositra)",
    'Bernard Gagnon',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Ambositra_04.jpg',
  ),
  'couverture-ririnina': photo(
    'couverture-ririnina',
    "Tanimbary misy dingana akaikin'i Betafo (rizières en terrasses près de Betafo)",
    'HoneyGaLe',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Rizi%C3%A8res_Betafo_1.jpg',
  ),
  vary: photo(
    'vary',
    'Tanimbary eto Madagasikara (rizière à Madagascar)',
    'Steve Evans',
    'CC BY 2.0',
    'https://commons.wikimedia.org/wiki/File:Paddy_field_in_Madagascar.jpg',
  ),
  katsaka: photo(
    'katsaka',
    'Salohim-katsaka (épi de maïs)',
    'Roger Culos',
    'CC BY-SA 3.0',
    "https://commons.wikimedia.org/wiki/File:Zea_mays_'vacquiers'_MHNT.BOT.2015.34.37.jpg",
  ),
  mangahazo: photo(
    'mangahazo',
    'Fakan-mangahazo vao nongotana (racine de manioc récoltée)',
    'Denis Kasozi',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Harvested_cassava_roots_06.jpg',
  ),
  voatabia: photo(
    'voatabia',
    'Voatabia masaka (tomates mûres)',
    'H. Zell',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Solanum_lycopersicum_003.JPG',
  ),
  karaoty: photo(
    'karaoty',
    'Karaoty vao nongotana (carottes récoltées)',
    'Forest et Kim Starr',
    'CC BY 2.0',
    'https://commons.wikimedia.org/wiki/File:Starr-210312-9133-Daucus_carota_subsp_sativus-harvested_from_veggie_garden-Hawea_Pl_Olinda-Maui_(51574544752).jpg',
  ),
  tsaramaso: photo(
    'tsaramaso',
    'Tsaramaso eo amin\'ny zavamaniry (haricots sur la plante)',
    'Hungda',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Hoa_v%C3%A0_qu%E1%BA%A3_%C4%91%E1%BA%ADu_c%C3%B4_ve-_Phaseolus_vulgaris.JPG',
  ),
}

// Couverture de l'accueil : ce que font les agriculteurs en ce moment.
// - novembre à février : repiquage, saison des pluies
// - mars à juin : récolte du riz
// - juillet à octobre : saison sèche, terrasses sous le ciel bleu
// (même correspondance dans public/couverture.js, pour la coquille de index.html)
export function couvertureDuMois(mois) {
  if (mois >= 3 && mois <= 6) return photos['couverture-recolte']
  if (mois >= 7 && mois <= 10) return photos['couverture-ririnina']
  return photos['couverture-repiquage']
}
