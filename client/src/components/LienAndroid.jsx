import { Download, Smartphone } from 'lucide-react'
import { useT } from '../i18n'
import { natif } from '../natif'

// Dernière version de l'application Android, servie par le site lui-même (le serveur la
// reprend des « Releases » GitHub, voir server/src/app.js) : pas de redirection vers un autre domaine.
export const ADRESSE_APK = 'https://tantsaha-connect.onrender.com/telecharger/tantsaha-connect.apk'

// Télécharger l'application Android depuis le site (gratuit, sans boutique) :
// sur un téléphone Android, un bouton ; sur un ordinateur, en plus, le QR code à
// scanner avec le téléphone. Rien dans l'application Android elle-même.
export default function LienAndroid() {
  const { t } = useT()
  if (natif) return null
  const android = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

  return (
    <section className="lien-android" aria-labelledby="lien-android-titre">
      <div className="lien-android-texte">
        <h2 id="lien-android-titre">
          <Smartphone size={22} strokeWidth={2.4} aria-hidden="true" /> {t('android.titre')}
        </h2>
        <p>{t('android.detail')}</p>
        <a className="bouton bouton-valider" href={ADRESSE_APK} download="tantsaha-connect.apk">
          <Download size={24} strokeWidth={2.6} aria-hidden="true" /> {t('android.telecharger')}
        </a>
        <p className="lien-android-aide">{t('android.aide')}</p>
      </div>
      {!android && <img className="lien-android-qr" src="/android-qr.svg" width="132" height="132" alt={t('android.qr')} />}
    </section>
  )
}
