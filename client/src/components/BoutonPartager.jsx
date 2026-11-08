import { Share2 } from 'lucide-react'
import { useT } from '../i18n'
import { partagePossible, partagerTexte } from '../natif'

// Bouton « Zarao » (partager) : envoie une alerte ou un conseil par WhatsApp, SMS…
// avec le menu de partage du téléphone. Les agriculteurs se transmettent déjà
// les informations entre voisins et dans les coopératives : l'application suit cet usage.
// Sans menu de partage (certains ordinateurs), le bouton n'apparaît pas.
export default function BoutonPartager({ titre, texte }) {
  const { t } = useT()
  if (!partagePossible()) return null

  function partager() {
    partagerTexte({ titre, texte: `${titre}\n${texte}\n\n${t('app.nom')}`, url: 'https://tantsaha-connect.onrender.com' })
  }

  return (
    <button type="button" className="bouton-partager" onClick={partager} aria-label={t('commun.partager')} title={t('commun.partager')}>
      <Share2 size={22} strokeWidth={2.4} aria-hidden="true" />
    </button>
  )
}
