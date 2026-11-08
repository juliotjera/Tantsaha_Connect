// Calendrier cultural des Hautes Terres de Madagascar.
// - cycle : nombre de jours entre le semis (ou la plantation) et la récolte
// - semis : mois favorables pour semer (1 = janvier)
//
// Sources :
// - riz, maïs, haricot : calendriers culturaux officiels de la Direction générale de la
//   Météorologie (Météo Madagascar) et du ministère de l'Agriculture (MINAE), saisons
//   2024-2025 et 2025-2026, régions Analamanga, Vakinankaratra, Haute Matsiatra,
//   Amoron'i Mania et Itasy (https://www.meteomadagascar.mg, rubrique calendriers culturaux) ;
// - manioc, tomate, carotte : pas de calendrier officiel publié ; pratiques décrites par
//   le CIRAD pour les Hautes Terres (cultures de contre-saison en bas-fond pendant la
//   saison sèche pour la tomate et la carotte ; boutures de manioc au début des pluies).
// Ces calendriers varient selon la région, l'altitude, la variété et l'année :
// à faire confirmer localement par un technicien (DRAE, FOFIFA).
export const calendrier = {
  // riz pluvial (tanety) et pépinière du riz de bas-fond : semis de novembre à mi-décembre,
  // récolte de fin mars à avril selon la variété (cycle court à long)
  vary: { cycleMin: 110, cycleMax: 150, semis: [11, 12] },
  // maïs : semis de mi-novembre à fin décembre, récolte en avril
  katsaka: { cycleMin: 110, cycleMax: 150, semis: [11, 12] },
  // manioc : boutures au début des pluies ; sur les Hautes Terres, récolte après 9 à 12 mois ou plus
  mangahazo: { cycleMin: 270, cycleMax: 365, semis: [10, 11, 12] },
  // tomate : contre-saison, en saison sèche (moins de maladies des feuilles)
  voatabia: { cycleMin: 90, cycleMax: 120, semis: [4, 5, 6, 7, 8] },
  // carotte : contre-saison, saison fraîche
  karaoty: { cycleMin: 90, cycleMax: 120, semis: [3, 4, 5, 6, 7, 8] },
  // haricot : semis de novembre à mi-décembre (cycle court) ou de janvier à début février,
  // récolte de mi-mars à avril
  tsaramaso: { cycleMin: 70, cycleMax: 95, semis: [11, 12, 1, 2] },
}
