# Messages vocaux en malagasy

Le bouton **Henoy** (écouter) lit le fichier `client/public/audio/<identifiant>.mp3`.
Sans fichier, il utilise la voix malagasy du téléphone si elle existe, sinon il indique « Tsy misy feo ».

## Voix actuelles : synthèse provisoire

Les fichiers présents ont été **générés par synthèse vocale** avec le modèle
[Meta MMS-TTS malagasy](https://huggingface.co/facebook/mms-tts-mlg)
(version ONNX [elloza/mms-tts-mlg-onnx](https://huggingface.co/elloza/mms-tts-mlg-onnx), exécutée avec Transformers.js).

- Licence **CC-BY-NC 4.0** : usage non commercial uniquement (prototype, projet d'école).
- Le modèle ne lit ni chiffres ni ponctuation : les nombres ont été écrits en toutes lettres
  (« dimy amby roapolo santimetatra »), et chaque phrase générée séparément, avec une courte pause.
- MP3 mono 16 kHz, 48 kbit/s : 30 à 90 Ko par message.

À remplacer par des enregistrements humains avant une vraie diffusion : même nom de fichier, rien d'autre à changer.

## Comment enregistrer

- Une voix claire, posée, par un locuteur natif (idéalement un technicien agricole ou un animateur de la région).
- Téléphone tenu à 20 cm, pièce calme, sans écho.
- Format **MP3, mono, 64 kbit/s** : un message de 15 secondes pèse environ 120 Ko (peu de crédit internet).
- Nommer le fichier exactement comme l'identifiant ci-dessous, puis le déposer dans ce dossier.
- Recompiler (`npm run build`) : les fichiers sont ajoutés automatiquement au mode hors ligne.

Faire relire les textes avant l'enregistrement : ils ont été rédigés pour le prototype.

## Conseils (rubrique Torohevitra)

Le texte à lire est le titre puis le texte de chaque fiche, dans `src/donnees/conseils.js`.

| Fichier | Fiche |
|---|---|
| `torohevitra-orana-mahery.mp3` | Rehefa ho avy ny orana mahery |
| `torohevitra-rivotra.mp3` | Rehefa misy rivotra mahery |
| `torohevitra-haintany.mp3` | Rehefa tsy misy orana |
| `torohevitra-bibikely.mp3` | Rehefa misy bibikely |
| `torohevitra-vary.mp3` | Fambolena vary |
| `torohevitra-katsaka.mp3` | Fambolena katsaka |
| `torohevitra-mangahazo.mp3` | Fambolena mangahazo |
| `torohevitra-voatabia.mp3` | Fambolena voatabia |
| `torohevitra-karaoty.mp3` | Fambolena karaoty |
| `torohevitra-tsaramaso.mp3` | Fambolena tsaramaso |
| `torohevitra-famafazana.mp3` | Rehefa hamafy |
| `torohevitra-fijinjana.mp3` | Rehefa hijinja |

## Alertes (rubrique Fanairana)

Messages généraux (sans chiffres ni date, qui changent chaque jour), voir `src/logique/alertes.js`.

| Fichier | Message à lire (proposition) |
|---|---|
| `alerte-orana-mahery-be.mp3` | Loza ! Orana mahery be no ho avy. Mety hisy tondra-drano. Diovy ny lakan-drano. |
| `alerte-orana-be.mp3` | Mitandrema. Orana be no ho avy amin'ny andro manaraka. |
| `alerte-rivotra-mahery-be.mp3` | Loza ! Rivotra mahery be no ho avy. Asio tsatoka ny voly ary ampio vato ny tafo. |
| `alerte-rivotra-mahery.mp3` | Mitandrema. Hisy rivotra mahery amin'ny andro manaraka. |
| `alerte-hafanana.mp3` | Mitandrema. Hafanana mafy no ho avy. Tondrahy ny voly amin'ny maraina na hariva. |
| `alerte-tsy-hisy-orana.mp3` | Mitandrema. Tsy hisy orana mandritra ny herinandro. Tondrahy ny voly vao nafafy. |
| `alerte-bibikely.mp3` | Mitandrema. Nisy bibikely hita tao amin'ny voly. Jereo ny voly hafa. |
| `alerte-fijinjana.mp3` | Fampahatsiahivana. Efa azo jinjaina ny voly. |
| `alerte-jinjao-alohan-ny-orana.mp3` | Mitandrema. Efa azo jinjaina ny voly ary hisy orana be. Jinjao alohan'ny orana. |
| `alerte-famafazana.mp3` | Fampahatsiahivana. Tonga ny fotoana famafazana. |

## Accueil (almanach de l'année agricole)

Explication de la lecture de l'almanach (texte `almanach.explication` dans `src/i18n/textes.js`).

| Fichier | Message à lire (proposition) |
|---|---|
| `almanach.mp3` | Ny taona fambolena. Ny tsipika maitso eo ambony dia fotoana famafazana. Ny tsipika mavo eo ambany dia fotoana fijinjana. Ny rahona misy orana dia fahavaratra, ny masoandro dia ririnina. Ny volana voalohany eo ankavia dia ity volana ity. Tsindrio ny voly iray hahitana ny torohevitra. |

## Petit guide du premier usage et confirmations

| Fichier | Message à lire (proposition) |
|---|---|
| `torolalana-toetrandro.mp3` | Toetrandro. Eto no hahitanao ny orana sy ny rivotra ho avy, ary ny fotoana tsara hanaovana fanafody. |
| `torolalana-fanairana.mp3` | Fanairana. Eto no ilazana anao raha misy loza. Ny mena dia loza : mitandrema avy hatrany. |
| `torolalana-rakitsoratra.mp3` | Rakitsoratra. Soraty eto ny famafazana, ny fijinjana, ny orana ary ny bibikely. Mandeha na tsy misy internet aza. |
| `torolalana-torohevitra.mp3` | Torohevitra. Eto no misy ny torohevitra ho an'ny voly tsirairay. Tsindrio ny Henoy raha hihaino. |
| `alerte-fanafody.mp3` | Fampahatsiahivana. Misy fotoana tsara hanaovana fanafody. Tsy misy orana ary malemy ny rivotra. |
| `retour-voatahiry.mp3` | Voatahiry. (après un enregistrement) |
| `retour-voafafa.mp3` | Voafafa. (après une suppression) |

## Accueil : « Ity volana ity » (ce mois-ci)

Un message par mois : les cultures à semer (calendrier cultural). Les récoltes, propres à chaque personne, ne sont lues qu'en français (voix du téléphone).

| Fichier | Message à lire (proposition) |
|---|---|
| `almanach-volana-01.mp3` | Janoary. Afafy izao ny tsaramaso. |
| `almanach-volana-02.mp3` | Febroary. Afafy izao ny tsaramaso. |
| `almanach-volana-03.mp3` | Martsa. Afafy izao ny karaoty. |
| `almanach-volana-04.mp3` | Aprily. Afafy izao ny voatabia ary ny karaoty. |
| `almanach-volana-05.mp3` | Mey. Afafy izao ny voatabia ary ny karaoty. |
| `almanach-volana-06.mp3` | Jona. Afafy izao ny voatabia ary ny karaoty. |
| `almanach-volana-07.mp3` | Jolay. Afafy izao ny voatabia ary ny karaoty. |
| `almanach-volana-08.mp3` | Aogositra. Afafy izao ny voatabia ary ny karaoty. |
| `almanach-volana-09.mp3` | Septambra. Tsy fotoana famafazana ity volana ity. |
| `almanach-volana-10.mp3` | Oktobra. Afafy izao ny mangahazo. |
| `almanach-volana-11.mp3` | Novambra. Afafy izao ny vary, ny katsaka, ny mangahazo ary ny tsaramaso. |
| `almanach-volana-12.mp3` | Desambra. Afafy izao ny vary, ny katsaka, ny mangahazo ary ny tsaramaso. |
