# Application Android : construire, signer, distribuer gratuitement

L'application Android (Capacitor 8, identifiant `mg.tantsaha.connect`) est le même code que le site :
interface, photos et voix sont dans l'APK (hors ligne dès la première ouverture), le journal part au
serveur en ligne. Elle ajoute les fonctions du téléphone : partage, voix française, notifications.

Distribution **gratuite** : APK publié dans les *Releases* GitHub, lien et QR code sur le site
(Fikirana et Mombamomba), et partage direct (WhatsApp, Bluetooth, Xender, carte SD).

---

## 1. Créer la clé de signature (une seule fois)

La clé prouve que chaque mise à jour vient bien de toi. **Si elle est perdue, plus aucune mise à jour
ne pourra s'installer par-dessus l'application existante** : garde-la avec son mot de passe en lieu sûr
(clé USB, coffre de mots de passe).

Dans PowerShell :

```powershell
New-Item -ItemType Directory -Force D:\portfolio-julio\cle-android
```

```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v -keystore D:\portfolio-julio\cle-android\tantsaha-connect.jks -alias tantsaha -keyalg RSA -keysize 2048 -validity 10000
```

`keytool` demande un mot de passe (deux fois), puis nom, organisation, ville, pays (`MG`), puis une
confirmation (`oui`).

Crée ensuite, avec le Bloc-notes, le fichier `client\android\signature.properties` :

```properties
storeFile=D:/portfolio-julio/cle-android/tantsaha-connect.jks
storePassword=ton-mot-de-passe
keyAlias=tantsaha
keyPassword=ton-mot-de-passe
```

Ce fichier et la clé ne vont **jamais** sur GitHub (`client/android/.gitignore`).

## 2. Construire la version signée

Dans `client` (avec le Java d'Android Studio : Gradle refuse Java 27) :

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

```powershell
npm run android:release
```

Résultat dans `client\android\sortie\` :
- `tantsaha-connect.apk` : à publier dans GitHub et à partager ;
- `tantsaha-connect.aab` : format des boutiques (Play Store, Huawei AppGallery…).

## 3. Publier sur GitHub (gratuit)

1. Sur https://github.com/juliotjera/Tantsaha_Connect : **Releases → Create a new release**.
2. *Choose a tag* : `v1.0.0` (*Create new tag*). Titre : `Tantsaha Connect 1.0.0`.
3. Glisser `tantsaha-connect.apk` dans la zone des fichiers (le nom doit rester **exactement** celui-ci).
4. **Publish release**.

Le lien du site pointe toujours vers la dernière version :
https://github.com/juliotjera/Tantsaha_Connect/releases/latest/download/tantsaha-connect.apk

## 4. Mettre à jour l'application

1. Dans `client/android/app/build.gradle` : `versionCode` + 1 (2, 3…) et `versionName` (`1.0.1`…).
2. `npm run android:release`.
3. Nouvelle *Release* GitHub (`v1.0.1`) avec le nouveau `tantsaha-connect.apk`.

Le téléphone installe la nouvelle version par-dessus l'ancienne (même clé), sans perdre le journal.

## Boutiques gratuites (plus tard)

Huawei AppGallery, Samsung Galaxy Store, Uptodown : compte gratuit, envoi du fichier `.aab` ou `.apk`,
politique de confidentialité : https://tantsaha-connect.onrender.com/mombamomba/tsiambaratelo.
F-Droid demande que tout soit sous licence libre : les voix malagasy actuelles (CC BY-NC) l'empêchent.
