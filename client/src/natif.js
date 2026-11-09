import { Capacitor } from '@capacitor/core'

// Application Android (Capacitor) ou site web : le même code, et ce module choisit
// la fonction du téléphone quand l'application est installée depuis l'APK
// (partage, voix française, notifications), celle du navigateur sinon.
// Les modules natifs ne sont chargés que dans l'application Android.
export const natif = Capacitor.isNativePlatform()

// Appareil du navigateur : sur Android, on propose l'application Android (APK) ;
// ailleurs (iPhone, ordinateur), l'installation du site (un APK n'y fonctionne pas)
const agent = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent)
export const surAndroid = () => /Android/i.test(agent())
export const surIOS = () =>
  /iPhone|iPad|iPod/i.test(agent()) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// --- partage (WhatsApp, SMS, Bluetooth…) ---

export const partagePossible = () => natif || (typeof navigator !== 'undefined' && !!navigator.share)

export async function partagerTexte({ titre, texte, url }) {
  if (natif) {
    const { Share } = await import('@capacitor/share')
    return Share.share({ title: titre, text: texte, url, dialogTitle: titre }).catch(() => {})
  }
  return navigator.share({ title: titre, text: texte, url }).catch(() => {}) // partage annulé : rien à faire
}

export const partageFichierPossible = (fichier) => natif || !!navigator.canShare?.({ files: [fichier] })

// Fichier (photo, sauvegarde) : dans l'application, il est d'abord écrit dans le cache du téléphone
export async function partagerFichier(fichier, titre) {
  if (!natif) return navigator.share({ files: [fichier], title: titre }).catch(() => {})
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const { Share } = await import('@capacitor/share')
  const donnees = await new Promise((ok) => {
    const lecteur = new FileReader()
    lecteur.onload = () => ok(String(lecteur.result).split(',')[1])
    lecteur.readAsDataURL(fichier)
  })
  const { uri } = await Filesystem.writeFile({ path: fichier.name, data: donnees, directory: Directory.Cache })
  return Share.share({ title: titre, files: [uri], dialogTitle: titre }).catch(() => {})
}

// --- voix du téléphone (français ; Android n'a en général pas de voix malagasy) ---

export async function parlerNatif(texte, langue) {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
  return TextToSpeech.speak({ text: texte, lang: langue === 'fr' ? 'fr-FR' : 'mg-MG', rate: 0.9 })
}

export async function arreterVoixNatif() {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
  return TextToSpeech.stop().catch(() => {})
}

// --- notifications de danger ---

export async function autoriserNotificationsNatif() {
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  const { display } = await LocalNotifications.requestPermissions()
  return display === 'granted' ? 'granted' : 'denied'
}

export async function notifierNatif({ id, titre, texte }) {
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  // identifiant numérique stable à partir de l'identifiant de l'alerte
  const numero = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7) & 0x7fffffff
  return LocalNotifications.schedule({ notifications: [{ id: numero, title: titre, body: texte, extra: { url: '/alertes' } }] })
}
