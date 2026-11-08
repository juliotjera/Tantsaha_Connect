# Déploiement : Tantsaha Connect en ligne (gratuit)

Architecture : **un seul service web** (l'API Node.js sert aussi l'interface compilée)
et **une base PostgreSQL**. Deux hébergeurs gratuits, sans carte bancaire (conditions à revérifier sur leurs sites au moment du déploiement) :

| Rôle | Hébergeur | Offre gratuite |
|---|---|---|
| Base PostgreSQL | [Neon](https://neon.tech) | 0,5 Go, sans limite de durée ; la base se met en veille et se réveille seule |
| Service web (API + interface) | [Render](https://render.com) | 750 h/mois ; mise en veille après 15 min sans visite, réveil en 30 à 60 s |

La mise en veille de Render ne gêne pas les agriculteurs : l'application installée s'ouvre et
fonctionne **hors ligne** (service worker), et le journal part au serveur dès qu'il répond.
HTTPS, obligatoire pour l'installation et le GPS, est fourni par Render.

Tout est prêt dans le dépôt : `render.yaml` (configuration du service), `.node-version` (Node 24),
commandes `npm run build` et `npm start` à la racine, tables créées automatiquement au premier démarrage.

---

## Étape 1 : envoyer le code sur GitHub

Le dépôt est déjà relié à `https://github.com/juliotjera/Tantsaha_Connect`.

Sur ce PC, Windows (contrôle intelligent des applications) bloque la bibliothèque réseau de Git
(`libcurl-4.dll`) : `git push` échoue dans le terminal. Deux solutions :

- **GitHub Desktop** (le plus simple) : *File > Add local repository* → `D:\portfolio-julio\Tantsaha_Connect`
  → *Publish repository* (ou *Push origin*). Il utilise sa propre version de Git.
- ou, depuis un autre ordinateur : `git push -u origin master`.

Créer d'abord le dépôt vide `Tantsaha_Connect` sur github.com s'il n'existe pas.
Le fichier `.env` (mots de passe) n'est jamais envoyé : il est dans `.gitignore`.

## Étape 2 : créer la base sur Neon

1. Créer un compte sur [neon.tech](https://neon.tech) (connexion avec GitHub possible).
2. *New project* : nom `tantsaha-connect`, PostgreSQL 17, région **AWS Europe Central (Frankfurt)**
   (la même que le service web).
3. *Connection string* : copier l'adresse qui commence par `postgresql://…` et finit par `?sslmode=require`.
   **Ne la coller nulle part ailleurs que dans Render** (elle contient le mot de passe).

Aucune table à créer : l'API les crée (ou les vérifie) à chaque démarrage, avec les 6 cultures de départ.

## Étape 3 : créer le service sur Render

1. Créer un compte sur [render.com](https://render.com) avec GitHub, et autoriser l'accès au dépôt `Tantsaha_Connect`.
2. *New > Blueprint* → choisir le dépôt : Render lit `render.yaml`.
3. Render demande la seule valeur secrète, **`DATABASE_URL`** : coller l'adresse Neon de l'étape 2.
4. *Apply* : premier déploiement (3 à 5 minutes : installation, compilation de l'interface, démarrage).

L'application est alors en ligne à une adresse du type `https://tantsaha-connect.onrender.com`.
Chaque `git push` sur `master` la redéploie automatiquement.

## Étape 4 : vérifier

| Vérification | Résultat attendu |
|---|---|
| `https://…onrender.com/api/sante` | `{"statut":"ok","base":"ok",…}` (`base: ok` = Neon joignable) |
| `https://…onrender.com/` | l'accueil ; premier lancement : choix de la langue puis du lieu |
| Noter un semis, puis ouvrir `/api/observations` | l'observation apparaît (synchronisation réussie) |
| Sur un téléphone Android, Chrome : menu > *Installer l'application* | icône Tantsaha Connect sur l'écran d'accueil |
| Mode avion, rouvrir l'application | elle s'ouvre, la météo gardée s'affiche, on peut noter |

Dans les journaux Render (*Logs*), le démarrage affiche :
`API Tantsaha Connect lancée…` puis `Base de données : postgres`.
Si on lit plutôt *Production sans PostgreSQL*, `DATABASE_URL` est absente ou mal copiée.

---

## Vérifié avant le déploiement

Le serveur a été lancé en mode production (`NODE_ENV=production`) sur la compilation actuelle :

- `/api/sante` répond ; les écrans (`/`, `/meteo`…) renvoient l'application (React Router choisit l'écran) ;
- service worker, manifeste, photos et messages vocaux servis avec le bon type ;
- compression active ; en-têtes de sécurité (CSP, HSTS, passage forcé en HTTPS) ;
- une adresse inconnue renvoie une vraie erreur 404 (`/api/…` et fichiers absents) ;
- synchronisation acceptée (avec ou sans culture, `null` compris) ; 15 tests de l'API et 14 parcours de bout en bout réussis.

## Variante : Docker

`Dockerfile` (image de production) et `docker-compose.yml` (application + PostgreSQL) sont fournis
pour un serveur à soi ou un autre hébergeur. Docker Desktop doit être lancé :
créer `.env` à la racine avec `POSTGRES_PASSWORD=…`, puis `docker compose up --build`.

## Limites de l'offre gratuite

- Render : réveil de 30 à 60 s après une période sans visite (sans effet sur l'application installée, hors ligne d'abord).
- Neon : 0,5 Go, largement suffisant (une observation pèse moins de 1 Ko).
- Pour un usage réel à grande échelle : passer à une offre payante ou à un hébergement national.
