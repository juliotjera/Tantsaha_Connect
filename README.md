# Tantsaha Connect

Application d'aide à la gestion des cultures et des saisons agricoles pour les paysans malagasy :
météo locale, alertes, journal de culture et conseils agricoles, avec une interface
compréhensible sans lire de texte, des messages vocaux en malagasy, et **utilisable hors ligne**.

## Fonctionnalités

| Rubrique | Ce qu'elle fait |
|---|---|
| **Toetrandro** (météo) | Temps actuel, lever et coucher du soleil, **heure par heure** (24 h) et 7 jours (Open-Meteo), lieu choisi par GPS ou dans la liste des chefs-lieux de région. **Bon moment pour traiter** les cultures : la plus longue période de jour sans pluie (ni l'heure suivante), vent ≤ 15 km/h et ≤ 30 °C, comme la « fenêtre de pulvérisation » des applications agricoles. Dernières prévisions consultables hors ligne. |
| **Fanairana** (alertes) | Calculées à partir de la météo et du journal : pluie forte, vent, chaleur, sécheresse sur des semis récents, parasites signalés, **récolte prête** (à avancer si la pluie arrive), **saison des semis**. Rouge = danger, orange = vigilance, vert = rappel. Rappel vert du **bon moment pour traiter** quand des cultures sont en cours. Chaque alerte ouvre le conseil correspondant et se **partage** (WhatsApp, SMS… avec le menu de partage du téléphone), comme les conseils. Pastille sur l'accueil. |
| **Rakitsoratra** (journal) | Semis, récolte, pluie, parasite : saisie en 3 touches (type, culture, date), sans rien écrire. **Ny voliko** : chaque culture en cours avec sa barre d'avancement jusqu'à la récolte et un bouton « Nijinja » (récolte faite). **Photo** facultative (parasite, maladie), gardée sur le téléphone et réduite (≈ 150 Ko), à montrer ou partager. Enregistré sur le téléphone, envoyé au serveur dès qu'internet revient. |
| **Torohevitra** (conseils) | Fiches courtes par culture, selon le temps et selon le calendrier (semer, récolter), filtrées par pictogrammes, avec bouton **Henoy** (écouter). |

Le calendrier cultural (durée des cycles, mois de semis) est dans `client/src/donnees/calendrier.js`.
Riz, maïs et haricot suivent les calendriers culturaux officiels de Météo Madagascar et du MINAE
(saisons 2024-2025 et 2025-2026, régions des Hautes Terres) ; manioc, tomate et carotte suivent les
pratiques décrites par le CIRAD. Ces valeurs restent à confirmer localement avec un technicien (DRAE, FOFIFA).

L'accueil présente ce calendrier en **almanach** (Ny taona fambolena) : les 12 prochains mois, la saison,
et par culture les mois de semis et de récolte prévue, avec une légende en pictogrammes et un bouton **Henoy**
qui explique la lecture à voix haute.

- **Hors ligne** : application installable (PWA, bouton « Installer » sur l'accueil). Une fois ouverte une première fois, elle s'ouvre et fonctionne sans réseau. Le journal est stocké dans IndexedDB et synchronisé automatiquement ; l'en-tête indique les observations pas encore envoyées.
- **Sans lecture** : pictogrammes, photos des cultures et couleurs constants, grandes zones à toucher, une question par écran, retour visuel, vibration et **confirmation vocale** (carillon puis « Voatahiry », « Voafafa »). **Petit guide** à voix haute après le premier lancement (les 4 rubriques), à revoir dans Fikirana.
- **Bilingue** : malagasy (par défaut) et français, choisis au premier lancement puis dans **Fikirana** (paramètres), avec la taille du texte, le lieu et les notifications des dangers.
- **Bilan** (Tatitra) : semis, récoltes, pluie et parasites des 6 derniers mois, en petits graphiques ou en tableau, à partager avec la coopérative.
- **Sauvegarde** (Fikirana, « Tahiry ») : le journal exporté dans un fichier et réimporté sur un autre téléphone (sans doublons, renvoyé au serveur).
- **Contrôle et erreurs** : suppression et récolte annulables (« Averina »), écran de secours en cas d'erreur imprévue.
- **Voix malagasy** : messages dans `client/public/audio/` (liste et textes à lire dans [`docs/voix-malagasy.md`](docs/voix-malagasy.md)) ; en français, voix du téléphone.
- **Accessibilité** : WCAG 2.1 AA vérifié par axe-core sur tous les écrans (malagasy, français, mode sombre, mode plein soleil), navigation au clavier, lien « aller au contenu », titre lu à chaque changement d'écran, trois apparences au choix dans Fikirana : clair (par défaut), **plein soleil** (contraste maximal, contours francs, textes plus gras) et sombre ; toutes auditées.

## Architecture

```
Tantsaha_Connect/
├── server/   API REST : Node.js + Express + PostgreSQL (port 5000)
├── client/   Interface : React + Vite, PWA (port 5173 en développement)
├── Dockerfile, docker-compose.yml   déploiement
└── package.json                     scripts communs (build, start, test)
```

### API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/sante` | état de l'API et de la base |
| GET | `/api/cultures` | cultures proposées |
| GET | `/api/observations?type=&page=&limite=` | liste paginée |
| POST | `/api/observations` | ajout (doublons ignorés grâce à `idClient`) |
| GET / DELETE | `/api/observations/:id` | lecture / suppression |
| POST | `/api/synchronisation` | envoi groupé depuis le téléphone : `{ creations, suppressions }` |

Organisation : routes → validation (zod) → contrôleurs → services (SQL paramétré) ; erreurs centralisées ;
en-têtes de sécurité (helmet) et limite de requêtes.

### Base de données

| `DB_MODE` | Moteur | Usage |
|---|---|---|
| `pglite` (par défaut) | PostgreSQL en WebAssembly, fichiers dans `server/.donnees` | développement : rien à installer |
| `memoire` | PGlite en mémoire | tests automatiques |
| `postgres` (ou `DATABASE_URL` défini) | serveur PostgreSQL | production |

Le SQL est le même dans tous les cas. Les tables sont créées au démarrage (`server/src/db/schema.sql`).

## Développement

Prérequis : Node.js 20 ou plus récent.

```bash
npm run installer
```

Puis, dans deux terminaux :

```bash
cd server && npm run dev
```

```bash
cd client && npm run dev
```

Ouvrir http://localhost:5173. Vite redirige les appels `/api` vers l'API.

Pour utiliser un serveur PostgreSQL local : copier `server/.env.example` en `server/.env`,
mettre `DB_MODE=postgres` et le mot de passe, puis `npm run db:migrer --prefix server`
(crée la base si elle n'existe pas).

## Tests

```bash
npm test
```

- `server/test` : 15 tests de l'API (node:test, base en mémoire) : validation, doublons, synchronisation.
- `client/src/**/*.test.js` : 52 tests Vitest (alertes, suivi des cultures, bilan, dates, météo, bilinguisme, stockage et synchronisation hors ligne).

Tests de bout en bout (Chrome installé sur la machine, ou `CHROME_PATH`) :

```bash
npm run test:e2e --prefix client
```

Ils compilent l'application, démarrent l'API avec une base en mémoire et une météo simulée, puis jouent les parcours
d'un agriculteur (premier lancement, alerte, saisie hors ligne et synchronisation, annulation, bilan, paramètres,
tailles d'écran) et l'audit d'accessibilité axe-core de chaque écran en malagasy, en français et en mode sombre.

Rapport Lighthouse (mobile) : [`docs/lighthouse.report.html`](docs/lighthouse.report.html) :
performance 83 à 89 selon les mesures, accessibilité 100, bonnes pratiques 100, SEO 100 (téléphone simulé : processeur ralenti 4 fois, réseau 4G lente).

Système de design (cadrage, jetons, composants, critique notée) : [`docs/systeme-design.md`](docs/systeme-design.md).

Test avec les agriculteurs : protocole prêt à l'emploi dans
[`docs/protocole-test-agriculteurs.md`](docs/protocole-test-agriculteurs.md) (5 participants, 7 tâches,
consentement oral, grille d'observation, critères de réussite, synthèse).

Textes malagasy : termes agricoles et de l'interface vérifiés avec le dictionnaire
[malagasyword.org](https://malagasyword.org) (« Raiketina », forme inexistante, remplacé par « Tehirizo »).
Une relecture par un locuteur natif reste nécessaire.

## Production

Un seul service : l'API sert aussi l'interface compilée.

```bash
npm run build
```

```bash
NODE_ENV=production DATABASE_URL=postgresql://… npm start
```

**Avec Docker** (PostgreSQL inclus) : créer un fichier `.env` à la racine contenant
`POSTGRES_PASSWORD=…`, puis :

```bash
docker compose up --build
```

**Hébergement gratuit** : base sur [Neon](https://neon.tech) et service web sur [Render](https://render.com), configuré par [`render.yaml`](render.yaml). Guide pas à pas : [`docs/deploiement.md`](docs/deploiement.md).
Commande de build `npm run build`, commande de démarrage `npm start`, variables `NODE_ENV=production` et
`DATABASE_URL` (adresse fournie par Neon). HTTPS est obligatoire pour l'installation de la PWA
et le GPS : les deux hébergeurs le fournissent.

## Note technique (Windows)

Smart App Control bloque les binaires natifs non signés. Le projet n'en utilise donc aucun en développement :
Rollup en WebAssembly (`@rollup/wasm-node`, voir `overrides` dans `client/package.json`), ESLint au lieu
d'oxlint, PGlite au lieu d'un serveur PostgreSQL local, et un service worker écrit à la main
(plugin dans `client/vite.config.js`) au lieu de vite-plugin-pwa.
