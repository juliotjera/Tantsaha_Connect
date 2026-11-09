// Textes de l'interface, en malagasy (langue par défaut) et en français.
// {nom} : valeur insérée au moment de l'affichage.
// Textes malagasy à faire relire par un locuteur natif avant diffusion.
export const textes = {
  // --- commun ---
  'app.nom': { mg: 'Tantsaha Connect', fr: 'Tantsaha Connect' },
  'commun.retourAccueil': { mg: "Hiverina any amin'ny fandraisana", fr: "Retour à l'accueil" },
  'commun.retourVers': { mg: 'Hiverina : {nom}', fr: 'Retour : {nom}' },
  'commun.fermer': { mg: 'Hidio', fr: 'Fermer' },
  'commun.annuler': { mg: 'Averina', fr: 'Annuler' },
  'android.titre': { mg: 'Fampiharana Android', fr: 'Application Android' },
  'android.detail': {
    mg: "Apetraho ao amin'ny finday Android : mandeha na tsy misy internet aza, miaraka amin'ny fizarana sy ny fampandrenesana.",
    fr: 'Installez-la sur un téléphone Android : elle marche sans internet, avec le partage et les notifications.',
  },
  'android.telecharger': { mg: 'Alaivo ny fampiharana', fr: "Télécharger l'application" },
  'android.aide': {
    mg: "Raha mangataka ny finday, avelao ny fametrahana avy amin'ity loharano ity.",
    fr: "Si le téléphone le demande, autorisez l'installation depuis cette source.",
  },
  'android.qr': {
    mg: "QR code : saro amin'ny finday Android mba haka ny fampiharana",
    fr: "QR code : scannez-le avec un téléphone Android pour télécharger l'application",
  },
  'apropos.confidentialite': { mg: 'Fiarovana ny angona', fr: 'Confidentialité' },
  'commun.partager': { mg: 'Zarao', fr: 'Partager' },

  // --- petit guide du premier usage ---
  'torolalana.titre': { mg: 'Torolalana fohy', fr: 'Petit guide' },
  'torolalana.toetrandro': {
    mg: 'Eto no hahitanao ny orana sy ny rivotra ho avy, ary ny fotoana tsara hanaovana fanafody.',
    fr: 'Ici, la pluie et le vent à venir, et le bon moment pour traiter les cultures.',
  },
  'torolalana.fanairana': {
    mg: 'Eto no ilazana anao raha misy loza. Ny mena dia loza : mitandrema avy hatrany.',
    fr: "Ici, l'application vous prévient d'un danger. Le rouge signale un danger : agissez vite.",
  },
  'torolalana.rakitsoratra': {
    mg: 'Soraty eto ny famafazana, ny fijinjana, ny orana ary ny bibikely. Mandeha na tsy misy internet aza.',
    fr: 'Notez ici vos semis, vos récoltes, la pluie et les parasites, même sans internet.',
  },
  'torolalana.torohevitra': {
    mg: "Eto no misy ny torohevitra ho an'ny voly tsirairay. Tsindrio ny Henoy raha hihaino.",
    fr: 'Ici, des conseils pour chaque culture. Appuyez sur Écouter pour les entendre.',
  },
  'torolalana.etape': { mg: '{n} amin\'ny {total}', fr: 'Étape {n} sur {total}' },
  'torolalana.passer': { mg: 'Avelao', fr: 'Passer' },
  'torolalana.suivant': { mg: 'Manaraka', fr: 'Suivant' },
  'torolalana.vita': { mg: 'Vita', fr: 'Terminé' },
  'connexion.oui': { mg: 'Misy internet', fr: 'En ligne' },
  'connexion.non': { mg: 'Tsy misy internet', fr: 'Hors ligne' },
  'connexion.ouiCourt': { mg: 'Misy', fr: 'En ligne' },
  'connexion.nonCourt': { mg: 'Tsy misy', fr: 'Hors ligne' },
  'connexion.attente': { mg: '{n} mbola tsy lasa', fr: "{n} en attente d'envoi" },
  'navigation.principale': { mg: 'Fitetezana', fr: 'Navigation principale' },

  // --- accueil ---
  'accueil.salut': { mg: 'Manao ahoana !', fr: 'Bonjour !' }, // espace insécable : « ! » jamais seul à la ligne
  'accueil.choisirLieu': { mg: 'Fidio ny toerana', fr: 'Choisir le lieu' },
  'accueil.noter': { mg: 'Soraty izay nitranga', fr: 'Noter une observation' },

  // --- almanach de l'année agricole ---
  'almanach.titre': { mg: 'Ny taona fambolena', fr: "L'année agricole" },
  'almanach.ceMois': { mg: 'Ity volana ity', fr: 'Ce mois-ci' },
  'almanach.afafy': { mg: 'Afafy izao', fr: 'À semer maintenant' },
  'almanach.tsyMisyAfafy': { mg: 'Tsy fotoana famafazana ity volana ity', fr: 'Pas de semis ce mois-ci' },
  'almanach.jinjao': { mg: 'Fijinjana', fr: 'Récoltes' },
  'almanach.izao': { mg: 'Izao', fr: 'Maintenant' },
  'almanach.aucuneRecolte': {
    mg: "Soraty ao amin'ny rakitsoratra ny famafazanao : hiseho eto ny andro fijinjana.",
    fr: "Notez vos semis dans le journal : la date de récolte s'affichera ici.",
  },
  'almanach.noteCourte': {
    mg: "Rehefa soratanao ao amin'ny rakitsoratra ny famafazanao, ny volinao ihany no hiseho eto, miaraka amin'ny fijinjana.",
    fr: "Quand vous notez vos semis dans le journal, seules vos cultures s'affichent ici, avec leur récolte.",
  },
  'almanach.annee': { mg: 'Jereo ny taona manontolo', fr: "Voir toute l'année" },
  'almanach.anneeMasquer': { mg: 'Afeno ny taona', fr: "Masquer l'année" },
  'almanach.fahavaratra': { mg: 'Fahavaratra', fr: 'Saison des pluies' },
  'almanach.ririnina': { mg: 'Ririnina', fr: 'Saison sèche' },
  'almanach.semis': { mg: 'Famafazana', fr: 'Semis' },
  'almanach.recolte': { mg: 'Fijinjana', fr: 'Récolte prévue' },
  // lu à voix haute par le bouton Henoy (le fichier audio/almanach.mp3 dit exactement le texte malagasy)
  'almanach.explication': {
    mg: "Ny taona fambolena. Ny tsipika maitso eo ambony dia fotoana famafazana. Ny tsipika mavo eo ambany dia fotoana fijinjana. Ny rahona misy orana dia fahavaratra, ny masoandro dia ririnina. Ny volana voalohany eo ankavia dia ity volana ity. Tsindrio ny voly iray hahitana ny torohevitra.",
    fr: "L'année agricole. Le trait vert en haut indique quand semer. Le trait jaune en bas indique la récolte prévue. Le nuage de pluie marque la saison des pluies, le soleil la saison sèche. La première colonne, à gauche, est le mois en cours. Appuyez sur une culture pour voir ses conseils.",
  },
  'almanach.note': {
    mg: "Soraty ny famafazanao ao amin'ny rakitsoratra : ny volinao ihany no hiseho eto.",
    fr: 'Notez vos semis dans le journal : seules vos cultures apparaîtront ici.',
  },
  'accueil.meteo': { mg: '{temps}, {degres} degre', fr: '{temps}, {degres} degrés' },

  // --- météo ---
  'meteo.changer': { mg: 'Ovay', fr: 'Changer' },
  'meteo.aucune': { mg: 'Tsy mbola misy vaovao momba ny toetrandro.', fr: 'Pas encore de prévisions.' },
  'meteo.chargement': { mg: 'Miandrasa kely', fr: 'Chargement' },
  'meteo.majLe': { mg: 'Nohavaozina {date}, {heure}', fr: 'Mis à jour le {date} à {heure}' },
  'meteo.echec': { mg: 'Tsy tafiditra ny vaovao', fr: 'Échec de la mise à jour' },
  'meteo.actualiser': { mg: 'Havaozina', fr: 'Actualiser' },
  'meteo.max': { mg: 'ambony indrindra', fr: 'maximum' },
  'meteo.min': { mg: 'ambany indrindra', fr: 'minimum' },
  'meteo.pluie': { mg: 'Orana', fr: 'Pluie' },
  'meteo.vent': { mg: 'Rivotra', fr: 'Vent' },
  'meteo.semaine': { mg: 'Andro fito', fr: 'Les 7 jours' },
  'meteo.lever': { mg: "Fiposahan'ny masoandro", fr: 'Lever du soleil' },
  'meteo.coucher': { mg: "Filentehan'ny masoandro", fr: 'Coucher du soleil' },
  'meteo.heures': { mg: "Isan'ora", fr: 'Heure par heure' },
  'meteo.maintenant': { mg: 'Izao', fr: 'Actuel' },
  'meteo.heure': { mg: '{h}:00', fr: '{h} h' },
  'meteo.heureDetail': { mg: '{heure} : {temps}, {degres}°, orana {proba}%', fr: '{heure} : {temps}, {degres}°, pluie {proba} %' },
  'meteo.traitement': { mg: 'Fotoana tsara hanaovana fanafody', fr: 'Bon moment pour traiter' },
  'meteo.traitementPlage': { mg: "{debut} ka hatramin'ny {fin}", fr: 'de {debut} à {fin}' },
  'meteo.traitementDetail': { mg: 'Tsy misy orana, malemy ny rivotra', fr: 'Pas de pluie, vent faible' },
  'meteo.traitementAucun': { mg: "Tsy misy fotoana tsara hanaovana fanafody amin'ny 24 ora ho avy", fr: 'Pas de bon moment pour traiter dans les 24 heures' },
  'meteo.demain': { mg: 'Rahampitso', fr: 'Demain' },
  'meteo.plage': { mg: "{min}° ka hatramin'ny {max}°", fr: 'de {min}° à {max}°' },
  'lieu.question': { mg: 'Aiza ianao ?', fr: 'Où êtes-vous ?' },
  'lieu.gps': { mg: 'Toerana misy ahy', fr: 'Ma position' },
  'lieu.recherche': { mg: 'Mitady…', fr: 'Recherche…' },
  'lieu.refuse': { mg: "Tsy hita ny toerana. Fidio ao amin'ny lisitra.", fr: 'Position introuvable. Choisissez dans la liste.' },
  'lieu.pres': { mg: "Akaikin'i {nom}", fr: 'Près de {nom}' },

  // --- alertes ---
  'alertes.choisirLieu': {
    mg: 'Fidio ny toerana misy anao mba hahazoana fanairana momba ny toetrandro',
    fr: 'Choisissez votre lieu pour recevoir les alertes météo',
  },
  'alertes.aucune': { mg: 'Tsy misy loza', fr: 'Aucun danger' },
  'alertes.periode': { mg: '{lieu}, andro 7', fr: '{lieu}, 7 jours' },
  'alertes.niveau.danger': { mg: 'Loza', fr: 'Danger' },
  'alertes.niveau.vigilance': { mg: 'Mitandrema', fr: 'Vigilance' },
  'alertes.niveau.info': { mg: 'Fampahatsiahivana', fr: 'Rappel' },
  'alertes.quoiFaire': { mg: 'Inona no atao ?', fr: 'Que faire ?' },

  // --- journal ---
  'journal.liste': { mg: 'Rakitsoratra', fr: 'Journal' },
  'journal.vide': { mg: 'Mbola tsy misy voasoratra', fr: "Aucune observation pour l'instant" },
  'journal.ajouter': { mg: 'Hanoratra', fr: 'Noter' },
  'journal.ajouterAria': { mg: 'Hanoratra vaovao', fr: 'Noter une observation' },
  'journal.voliko': { mg: 'Ny voliko', fr: 'Mes cultures' },
  'journal.jour': { mg: 'andro {n}', fr: 'jour {n}' },
  'journal.pret': { mg: 'Efa azo jinjaina', fr: 'Prête à récolter' },
  'journal.recolteLe': { mg: 'Jinja : {date}', fr: 'Récolte : {date}' },
  'journal.recolter': { mg: 'Nijinja', fr: 'Récolté' },
  'journal.recolterAria': { mg: 'Nijinja ny {culture}', fr: 'Récolté : {culture}' },
  'journal.envoye': { mg: "Voatahiry amin'ny internet", fr: 'Envoyée au serveur' },
  'journal.local': { mg: "Voatahiry ato amin'ny finday", fr: 'Enregistrée sur le téléphone' },
  'journal.supprimer': { mg: 'Fafana', fr: 'Supprimer' },
  'journal.supprime': { mg: 'Voafafa : {quoi}', fr: 'Supprimé : {quoi}' },
  'journal.recolteNotee': { mg: 'Voasoratra ny fijinjana : {culture}', fr: 'Récolte notée : {culture}' },

  // --- nouvelle observation ---
  'saisie.etapes': { mg: 'Dingana', fr: 'Étapes' },
  'saisie.etape': { mg: 'Dingana {n}', fr: 'Étape {n}' },
  'saisie.etapeQuoi': { mg: 'Inona', fr: 'Quoi' },
  'saisie.etapeVoly': { mg: 'Voly', fr: 'Culture' },
  'saisie.etapeDaty': { mg: 'Oviana', fr: 'Quand' },
  'saisie.photo': { mg: 'Haka sary', fr: 'Prendre une photo' },
  'saisie.photoEsory': { mg: 'Esory ny sary', fr: 'Retirer la photo' },
  'saisie.photoApercu': { mg: 'Ny sary nalaina', fr: 'La photo prise' },
  'journal.voirPhoto': { mg: 'Jereo ny sary : {quoi}', fr: 'Voir la photo : {quoi}' },
  'saisie.quoi': { mg: 'Inona no nitranga ?', fr: "Que s'est-il passé ?" },
  'saisie.culture': { mg: 'Inona no voly ?', fr: 'Quelle culture ?' },
  'saisie.sansCulture': { mg: 'Tsy voafaritra', fr: 'Sans culture précise' },
  'saisie.quand': { mg: 'Oviana ?', fr: 'Quand ?' },
  'saisie.aujourdhui': { mg: 'Androany', fr: "Aujourd'hui" },
  'saisie.hier': { mg: 'Omaly', fr: 'Hier' },
  'saisie.semaine': { mg: 'Herinandro lasa', fr: 'Il y a 7 jours' },
  'saisie.precedent': { mg: 'Andro iray teo aloha', fr: 'Jour précédent' },
  'saisie.suivant': { mg: 'Andro iray manaraka', fr: 'Jour suivant' },
  'saisie.enregistrer': { mg: 'Tehirizo', fr: 'Enregistrer' },
  'saisie.enregistre': { mg: 'Voatahiry !', fr: 'Enregistré !' },

  // --- conseils ---
  'conseils.filtre': { mg: 'Sivana', fr: 'Filtre' },
  'conseils.tous': { mg: 'Rehetra', fr: 'Tout' },
  'conseils.temps': { mg: 'Toetrandro', fr: 'Météo' },
  'conseils.saisons': { mg: 'Fotoana', fr: 'Saisons' },
  'conseils.voly': { mg: 'Voly', fr: 'Cultures' },

  // --- voix ---
  'ecouter.lire': { mg: 'Henoy', fr: 'Écouter' },
  'ecouter.arreter': { mg: 'Ajanony', fr: 'Arrêter' },
  'ecouter.aucune': { mg: 'Tsy misy feo', fr: 'Pas de voix' },

  // --- mise à jour de l'application ---
  'maj.disponible': { mg: 'Misy fanavaozana vaovao', fr: 'Nouvelle version disponible' },
  'maj.installer': { mg: 'Havaozina', fr: 'Mettre à jour' },

  // --- premier lancement et paramètres ---
  'fikirana.soleil': { mg: 'Masoandro', fr: 'Plein soleil' },
  'fikirana.son': { mg: 'Feo', fr: 'Sons et voix' },
  'fikirana.sonDetail': {
    mg: 'Feo fohy rehefa voatahiry na voafafa ny zavatra iray',
    fr: 'Un son court quand une observation est enregistrée ou supprimée',
  },
  'fikirana.sonOui': { mg: 'Mandeha', fr: 'Activés' },
  'fikirana.sonNon': { mg: 'Tsy mandeha', fr: 'Désactivés' },
  'fikirana.torolalana': { mg: 'Torolalana', fr: 'Petit guide' },
  'fikirana.torolalanaDetail': { mg: 'Jereo indray ny fanazavana fohy', fr: "Revoir la présentation de l'application" },
  'fikirana.tahiry': { mg: 'Tahiry', fr: 'Sauvegarde' },
  'fikirana.tahiryDetail': {
    mg: 'Ataovy rakitra ny rakitsoratrao, mba tsy ho very raha very na miova ny finday (tsy misy sary).',
    fr: 'Enregistrez votre journal dans un fichier, pour le garder si vous perdez ou changez de téléphone (sans les photos).',
  },
  'fikirana.exporter': { mg: 'Avoaka', fr: 'Exporter' },
  'fikirana.importer': { mg: 'Ampidiro', fr: 'Importer' },
  'fikirana.importes': { mg: '{n} voaray', fr: '{n} observation(s) ajoutée(s)' },
  'fikirana.importErreur': { mg: 'Tsy azo vakiana ity rakitra ity', fr: 'Ce fichier ne peut pas être lu' },
  'fikirana.titre': { mg: 'Fikirana', fr: 'Paramètres' },
  'fikirana.langue': { mg: 'Fiteny', fr: 'Langue' },
  'fikirana.taille': { mg: "Haben'ny soratra", fr: 'Taille du texte' },
  'fikirana.normal': { mg: 'Mahazatra', fr: 'Normale' },
  'fikirana.grand': { mg: 'Lehibe', fr: 'Grande' },
  'fikirana.lieu': { mg: 'Toerana', fr: 'Lieu' },
  'fikirana.theme': { mg: 'Endrika', fr: 'Apparence' },
  'fikirana.clair': { mg: 'Mazava', fr: 'Clair' },
  'fikirana.sombre': { mg: 'Maizina', fr: 'Sombre' },
  'fikirana.aucunLieu': { mg: 'Tsy mbola voafidy', fr: 'Pas encore choisi' },
  'fikirana.apropos': { mg: 'Mombamomba sy loharano', fr: 'À propos et sources' },

  // --- accessibilité, erreurs ---
  'commun.allerContenu': { mg: "Mankany amin'ny votoatiny", fr: 'Aller au contenu' },
  'erreur.titre': { mg: 'Nisy olana kely', fr: 'Un problème est survenu' },
  'erreur.detail': { mg: 'Tsy very ny rakitsoratrao. Avereno alefa ny fampiharana.', fr: "Votre journal n'est pas perdu. Relancez l'application." },
  'erreur.relancer': { mg: 'Avereno alefa', fr: 'Relancer' },

  // --- installation sur le téléphone ---
  'installer.bouton': { mg: "Apetraho ao amin'ny finday", fr: "Installer l'application" },
  'installer.detail': { mg: 'Mandeha na tsy misy internet aza', fr: 'Fonctionne même sans internet' },

  // --- premier lancement : lieu ---
  'premier.lieu': { mg: 'Aiza ny tanimbolinao ?', fr: 'Où se trouve votre champ ?' },
  'premier.plusTard': { mg: 'Avy eo', fr: 'Plus tard' },

  // --- journal vide et bilan ---
  'journal.premiere': { mg: 'Soraty ny voalohany', fr: 'Noter ma première observation' },
  'journal.videDetail': {
    mg: "Soraty eto ny famafazana, ny fijinjana, ny orana ary ny bibikely.",
    fr: 'Notez ici vos semis, vos récoltes, la pluie et les parasites.',
  },
  'journal.bilan': { mg: 'Tatitra', fr: 'Bilan' },
  'bilan.periode': { mg: 'Volana 6 farany', fr: '6 derniers mois' },
  'bilan.total': { mg: "{n} amin'ny volana 6", fr: '{n} en 6 mois' },
  'bilan.videDetail': {
    mg: 'Soraty ny famafazana, ny fijinjana, ny orana ary ny bibikely : hiseho eto ny tatitra.',
    fr: 'Notez semis, récoltes, pluie et parasites : votre bilan apparaîtra ici.',
  },
  'horsLigne.titre': { mg: 'Tsy misy internet.', fr: "Pas d'internet." },
  'horsLigne.detail': { mg: 'Mandeha ihany ny fampiharana ; halefa any aoriana ny voasoratra.', fr: "L'application fonctionne quand même ; vos notes partiront plus tard." },
  'lieu.hautesTerres': { mg: 'Afovoan-tany', fr: 'Hautes Terres' },
  'lieu.autres': { mg: 'Faritra hafa', fr: 'Autres régions' },
  'alertes.rappels': { mg: 'Fampahatsiahivana', fr: 'Rappels' },
  'bilan.vide': { mg: "Tsy mbola misy voasoratra tao anatin'ny volana 6.", fr: 'Aucune observation sur les 6 derniers mois.' },
  'bilan.valeur': { mg: '{mois} : {n}', fr: '{mois} : {n}' },
  'bilan.voirTableau': { mg: 'Jereo ho tabilao', fr: 'Voir en tableau' },
  'bilan.voirGraphique': { mg: 'Jereo ho sary', fr: 'Voir en graphique' },
  'bilan.mois': { mg: 'Volana', fr: 'Mois' },

  // --- notifications ---
  'fikirana.notifications': { mg: 'Fampandrenesana', fr: 'Notifications' },
  'fikirana.notifDetail': {
    mg: 'Lazaina aminao ny loza, na tsy jerena aza ny fampiharana',
    fr: "Être prévenu d'un danger même quand l'application n'est pas à l'écran",
  },
  'fikirana.activees': { mg: 'Mandeha', fr: 'Activées' },
  'fikirana.desactivees': { mg: 'Tsy mandeha', fr: 'Désactivées' },
  'fikirana.refusees': { mg: "Nolavina tao amin'ny fikirana ny finday", fr: 'Refusées dans les réglages du téléphone' },
}
