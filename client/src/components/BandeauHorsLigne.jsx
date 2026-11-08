import { WifiOff } from 'lucide-react'
import { useEnLigne } from '../hooks/useEnLigne'
import { useT } from '../i18n'

// Sans internet : un message clair en haut de chaque écran, et rassurant
// (l'application continue de marcher, rien n'est perdu). Pas de rouge : ce n'est pas un danger.
export default function BandeauHorsLigne() {
  const enLigne = useEnLigne()
  const { t } = useT()
  if (enLigne) return null
  return (
    <p className="hors-ligne" role="status">
      <WifiOff size={22} strokeWidth={2.4} aria-hidden="true" />
      <span>
        <strong>{t('horsLigne.titre')}</strong> {t('horsLigne.detail')}
      </span>
    </p>
  )
}
