import { CircleCheck, Undo2 } from 'lucide-react'
import { useT } from '../i18n'
import { fermerAnnonce, useAnnonce } from '../stockage/annonces'

// Affiche l'annonce en cours (retour immédiat après une action) et propose
// de l'annuler : plus rapide qu'une confirmation, et l'erreur se corrige
// en un appui (contrôle de l'utilisateur, correction des erreurs).
export default function Annonces() {
  const annonce = useAnnonce()
  const { t } = useT()

  return (
    <div className="annonces" role="status" aria-live="polite">
      {annonce && (
        <div className="annonce" key={annonce.id}>
          <CircleCheck size={22} strokeWidth={2.6} aria-hidden="true" />
          <span className="annonce-texte">{annonce.texte}</span>
          {annonce.annuler && (
            <button
              type="button"
              className="annonce-annuler"
              onClick={() => {
                annonce.annuler()
                fermerAnnonce()
              }}
            >
              <Undo2 size={20} strokeWidth={2.6} aria-hidden="true" /> {t('commun.annuler')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
