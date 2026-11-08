import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { natif } from '../natif'

// Installe le service worker (application utilisable hors ligne) et propose
// d'activer une nouvelle version quand elle est prête. L'utilisateur choisit
// le moment : l'écran ne se recharge jamais en pleine saisie.
export default function MiseAJour() {
  const [enAttente, setEnAttente] = useState(null) // nouvelle version installée, pas encore active
  const { t } = useT()

  useEffect(() => {
    // seulement la version compilée : en développement, le cache gênerait les modifications
    // ni dans l'application Android : tout y est déjà, et elle se met à jour par l'APK
    if (!import.meta.env.PROD || natif || !('serviceWorker' in navigator)) return

    let rechargement = false
    const recharger = () => {
      if (rechargement) return
      rechargement = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', recharger)

    navigator.serviceWorker.register('/sw.js').then((inscription) => {
      // une mise à jour déjà prête (téléchargée lors d'une visite précédente)
      if (inscription.waiting && navigator.serviceWorker.controller) setEnAttente(inscription.waiting)
      inscription.addEventListener('updatefound', () => {
        const nouveau = inscription.installing
        nouveau?.addEventListener('statechange', () => {
          // première installation (pas encore de contrôleur) : rien à proposer
          if (nouveau.state === 'installed' && navigator.serviceWorker.controller) setEnAttente(nouveau)
        })
      })
      // vérifie s'il existe une nouvelle version quand l'application revient au premier plan
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') inscription.update().catch(() => {})
      })
    })

    return () => navigator.serviceWorker.removeEventListener('controllerchange', recharger)
  }, [])

  if (!enAttente) return null
  return (
    <div className="mise-a-jour" role="status">
      <span>{t('maj.disponible')}</span>
      <button type="button" className="bouton" onClick={() => enAttente.postMessage({ type: 'activer' })}>
        <RefreshCw size={22} strokeWidth={2.6} aria-hidden="true" /> {t('maj.installer')}
      </button>
    </div>
  )
}
