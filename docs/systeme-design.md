# Système de design : Tantsaha Connect

Document établi avec la méthode « design avant le code » (/design-system, /critique, /polish) :
cadrage en 4 points, jetons, composants, puis critique notée et finitions appliquées.
Les valeurs ci-dessous sont celles du code (`client/src/index.css`, `client/src/rubriques.css`).

---

## 1. Cadrage (/design-system)

### 1.1 Problème et public

- **Public** : agriculteurs et agricultrices des Hautes Terres de Madagascar ; beaucoup lisent difficilement ;
  smartphones Android d'entrée de gamme ; réseau rare aux champs ; écran lu en plein soleil ; malagasy d'abord, français ensuite.
- **Friction résolue** : savoir quand semer, récolter et traiter, être prévenu d'un danger (forte pluie, vent, parasites),
  et garder la trace de son travail, sans internet et sans avoir à lire de longs textes.

### 1.2 Direction visuelle retenue : « éditorial minimal », ancré dans le terrain

Parmi les quatre directions de la méthode :

| Direction | Décision | Raison |
|---|---|---|
| Brutalisme | **Gardé pour le mode « plein soleil »** seulement | Contours francs et contraste maximal : exactement ce qu'il faut dehors en pleine lumière |
| Néomorphisme / claymorphisme | Écarté | Les reliefs doux disparaissent au soleil et trompent sur ce qui se touche |
| Verre dépoli / sombre premium | Écarté (sauf la pastille du lieu sur la photo d'accueil) | Flous coûteux pour les petits téléphones ; peu lisible dehors |
| **Éditorial minimal** | **Retenu** | Beaucoup d'air, hiérarchie typographique stricte, une seule couleur d'action : lisible par tous |

### 1.3 Contraintes techniques

- Mobile d'abord (320 px à 560 px), tablette (640 à 959 px), ordinateur (960 px et plus : colonne de navigation à gauche).
- Trois apparences : clair (par défaut), plein soleil, sombre ; toutes auditées WCAG 2.1 AA (axe-core, 0 violation).
- Texte agrandi (Fikirana) : toutes les tailles en `rem`.
- Hors ligne : polices, photos et voix embarquées ; aucun appel à un service de polices.
- Mouvement réduit respecté (`prefers-reduced-motion`), transparence réduite respectée.

### 1.4 Élément signature

**Les courbes de niveau des rizières en terrasses**, reprises du logo : une texture topographique très légère
en haut de chaque écran (au bas de la colonne sur ordinateur) et dans les fenêtres d'accueil.
Avec la photo des terrasses d'Imerina en couverture de l'accueil, c'est ce qui rend l'application reconnaissable.

---

## 2. Jetons

### 2.1 Couleurs (mode clair)

| Rôle | Jeton | Valeur | Usage |
|---|---|---|---|
| Fond | `--fond` | `#f1f3ee` | gris-vert très clair, moins éblouissant que le blanc |
| Surface | `--surface` | `#ffffff` | cartes, listes, barre de navigation |
| Encre | `--texte` | `#18241c` | texte principal (16:1) |
| Encre douce | `--texte-doux` | `#4b574e` | texte secondaire |
| Marque | `--marque` | `#1f5c37` | **seule couleur d'action** : boutons, onglet actif, sélection |
| Vigilance | `--vigilance` | `#9a5a12` | ocre : à surveiller, parasites |
| Danger | `--danger` | `#b42318` | rouge **réservé au danger** |
| Pluie | `--pluie` | `#1a5fc0` | la donnée « pluie » seulement |
| Semis / récolte | `--semis`, `--recolte` | `#2b7a4b`, `#d6a54a` | almanach (palette vérifiée pour les daltoniens) |

Mode sombre et mode plein soleil : mêmes rôles, valeurs redéfinies dans `index.css`.

### 2.2 Typographie

| Rôle | Police | Pourquoi |
|---|---|---|
| Titres, grands chiffres | **Bricolage Grotesque** (variable, embarquée) | allure des enseignes peintes des marchés ; personnalité sans perdre la lisibilité |
| Textes courants | **Atkinson Hyperlegible Next** (variable, embarquée) | conçue pour la lisibilité des lecteurs fragiles |
| Chiffres | police du téléphone (Roboto, Segoe UI) | Atkinson barre le zéro (« 3Ø ») ; repli sur Atkinson si absente |

- **Échelle** (rapport ≈ 1,15) : `--taille-xs` 0,72 · `-s` 0,82 · `-m` 0,94 · `-base` 1 · `-l` 1,18 · `-xl` 1,41 · `-xxl` 1,76 rem ;
  grands chiffres hors échelle (bonjour 2,35 rem, température 3,7 à 4,8 rem).
- **Graisses** : 450 et 650 (texte) ; 300 et 700 pour la police de titre (chiffres fins, titres forts).
- **Approche** : `-0,02em` à `-0,05em` sur les grands titres et chiffres ; jamais de capitales pour les libellés.
- **Nombres** : virgule décimale et espace insécable avant l'unité (« 30,3 mm »).

### 2.3 Espacements

Grille de **4 px** : 4, 8, 12, 16, 20, 24, 32, 40, 48 ; 2 px seulement pour les détails fins
(contrôlé : aucune valeur hors grille dans les feuilles de style).

### 2.4 Formes et profondeur

| Jeton | Valeur | Usage |
|---|---|---|
| `--rayon-s` | 12 px | boutons, champs, pastilles |
| `--rayon` | 20 px | cartes |
| `--rayon-l` | 24 px | grandes surfaces (météo du moment) |
| photo d'accueil | 28 px | couverture |
| `--ombre-1` | très légère | petits éléments posés sur le fond |
| `--ombre` | douce | cartes |
| `--ombre-2` | marquée | éléments flottants (navigation, bouton « Hanoratra », annonces) |
| `--ombre-navigation` | filet + ombre portée vers le haut | barre de navigation |

Pas de contours : les surfaces se détachent par l'ombre (mode sombre : filet ; plein soleil : contour de 2 px).

### 2.5 Mouvement

| Jeton | Valeur | Usage |
|---|---|---|
| `--courbe` | `cubic-bezier(0.16, 1, 0.3, 1)` | départ vif, arrivée douce, partout |
| `--duree-courte` | 160 ms | appui, survol, focus |
| `--duree` | 320 ms | ouverture, apparition (année de l'almanach, étapes du guide et de la saisie, annonces) |

Un seul mouvement non déclenché par la personne : le léger recul de la photo à l'ouverture de l'accueil.
Au clavier, l'anneau de focus se resserre sur l'élément atteint.

---

## 3. Composants

| Composant | Rôle | Règles |
|---|---|---|
| En-tête | où l'on est, retour, connexion, paramètres | boutons ronds identiques ; titre en police de titre, tronqué proprement |
| Navigation | 5 rubriques | barre flottante en bas (téléphone), colonne à gauche (ordinateur) ; pictogramme + nom ; onglet actif plein |
| Couverture d'accueil | bonjour, date, lieu, temps | photo des terrasses ; voile sombre pour la lisibilité |
| Bandeau d'alerte | l'alerte la plus grave | fond teinté selon le niveau ; danger plus marqué |
| « Ity volana ity » | quoi faire ce mois | photos des cultures à semer et à récolter ; Henoy ; l'année entière à la demande |
| « Soraty izay nitranga » | noter en un appui | 4 types ; ouvre la saisie sur la bonne étape |
| Carte d'alerte | danger, vigilance | grande carte, Henoy et « Inona no atao ? » sur une ligne, partage |
| Rappel | information du calendrier | ligne compacte, flèche vers le conseil, Henoy |
| Sélecteur segmenté | réglages | rail gris, pastille blanche sur le choix |
| Puce de filtre | conseils | arrondie, pleine au vert quand choisie |
| Bouton Henoy | écouter | tonal (vert pâle) ; message malagasy préparé, voix du téléphone en français |
| Annonce | retour après une action | en bas, sombre, avec « Averina » (annuler) |
| États vides | inviter à agir | grand pictogramme, une phrase, un bouton |
| Bandeau hors ligne | état du système | neutre (pas de rouge), rassurant |

---

## 4. Critique notée (/critique)

Notes sur 10, après les finitions de la section 5.

| Critère | Note | Constat |
|---|---|---|
| Composition, mise en page | 8 | Hiérarchie claire, action principale sur l'accueil, élément signature ; sur ordinateur, les cartes restent assez régulières (pas de vraie grille « bento ») |
| Typographie | 8,5 | Deux familles distinctes, échelle et graisses tenues, approche serrée des titres ; quelques mots malagasy longs passent à la ligne sur 320 px |
| Couleur | 9 | Palette resserrée et sémantique, rouge réservé au danger, contrastes AA dans les trois apparences |
| Espacement | 9 | Grille de 4 px respectée partout |
| Mouvement | 8 | Une courbe, deux durées, uniquement en réponse aux gestes ; mouvement réduit respecté |
| Accessibilité | 9,5 | axe-core : 0 violation (malagasy, français, sombre, plein soleil) ; reste à tester avec un lecteur d'écran sur téléphone |
| UX pour le public | 8,5 | Pictogrammes, photos, voix, hors ligne, une question par écran ; à confirmer par le test avec 5 agriculteurs |
| « Effet IA générique » | 8,5 | Ni Inter ni dégradé violet ; risque restant : beaucoup de cartes blanches arrondies, atténué par les listes groupées, les rayons variés et le motif |

**Moyenne : 8,6 / 10.** Limites : notes établies par le concepteur ; seul le test terrain dira si les choix aident vraiment.

---

## 5. Finitions appliquées (/polish)

- 176 espacements hors échelle (6, 10, 14, 18, 22 px…) recalés sur la grille de 4 px.
- Une courbe de mouvement unique et deux durées, au lieu de quatre courbes différentes.
- Ombres codées en dur remplacées par des jetons (`--ombre-navigation`).
- Micro-interactions : anneau de focus qui se resserre ; année de l'almanach qui se déplie ;
  étapes du guide qui arrivent de la droite ; questions de la saisie qui apparaissent en douceur.
