import { Share2 } from 'lucide-react'
import { useT } from '../i18n'

// Bouton « Zarao » (partager) : envoie une alerte ou un conseil par WhatsApp, SMS…
// avec le menu de partage du téléphone. Les agriculteurs se transmettent déjà
// les informations entre voisins et dans les coopératives : l'application suit cet usage.
// Sans menu de partage (certains ordinateurs), le bouton n'apparaît pas.
export default function BoutonPartager({ titre, texte }) {
  const { t } = useT()
  if (typeof navigator === 'undefined' || !navigator.share) return null

  function partager() {
    navigator
      .share({ title: titre, text: `${titre}\n${texte}\n\n${t('app.nom')}`, url: window.location.origin })
      .catch(() => {}) // partage annulé par la personne : rien à faire
  }

  return (
    <button type="button" className="bouton-partager" onClick={partager} aria-label={t('commun.partager')} title={t('commun.partager')}>
      <Share2 size={22} strokeWidth={2.4} aria-hidden="true" />
    </button>
  )
}
