import { Download } from 'lucide-react'
import { useT } from '../i18n'
import { surAndroid } from '../natif'
import { installer, useInstallable } from '../stockage/installation'

// Bouton « Installer l'application » (le site comme application) : visible seulement quand le
// navigateur le permet, et jamais sur Android, où l'application Android (LienAndroid) la remplace.
export default function BoutonInstaller() {
  const { t } = useT()
  const installable = useInstallable()
  if (!installable || surAndroid()) return null

  return (
    <button type="button" className="bouton-installer" onClick={installer}>
      <Download size={26} strokeWidth={2.6} aria-hidden="true" />
      <span>
        <strong>{t('installer.bouton')}</strong>
        <small>{t('installer.detail')}</small>
      </span>
    </button>
  )
}
