import { Download } from 'lucide-react'
import { useT } from '../i18n'
import { installer, useInstallable } from '../stockage/installation'

// Bouton « Installer l'application » : visible seulement quand le navigateur
// permet l'installation (et disparaît une fois l'application installée).
export default function BoutonInstaller() {
  const { t } = useT()
  const installable = useInstallable()
  if (!installable) return null

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
