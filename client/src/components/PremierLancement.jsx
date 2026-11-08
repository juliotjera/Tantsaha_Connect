import { useEffect, useRef } from 'react'
import { useT } from '../i18n'
import { useMeteo } from '../stockage/meteo'
import { changerLangue, terminerAccueil, usePreferences } from '../stockage/preferences'
import ChoixLieu from './ChoixLieu'
import Logo from './Logo'

// Premier lancement, en deux questions :
// 1. la langue (les deux phrases d'accueil sont affichées dans les deux langues,
//    pour que chacun comprenne la question) ;
// 2. le lieu du champ, pour que la météo et les alertes servent dès la première
//    minute (« plus tard » reste possible).
// Les deux choix se modifient ensuite dans « Fikirana ».
export default function PremierLancement() {
  const { langueChoisie, accueilFini } = usePreferences()
  const meteo = useMeteo()
  const { t } = useT()
  const carte = useRef(null)

  const etape = !langueChoisie ? 'langue' : !accueilFini && meteo.pret && !meteo.lieu ? 'lieu' : null

  // le lieu est déjà connu (installation précédente) : rien à demander
  useEffect(() => {
    if (langueChoisie && !accueilFini && meteo.pret && meteo.lieu) terminerAccueil()
  }, [langueChoisie, accueilFini, meteo.pret, meteo.lieu])

  // le focus va dans la fenêtre à chaque étape (clavier, lecteur d'écran)
  useEffect(() => {
    carte.current?.querySelector('button')?.focus()
  }, [etape])

  if (!etape) return null

  return (
    <div className="premier" role="dialog" aria-modal="true" aria-labelledby="premier-titre">
      <div className={`premier-carte ${etape === 'lieu' ? 'premier-carte-large' : ''}`} ref={carte}>
        {etape === 'langue' ? (
          <>
            <Logo taille={64} />
            <h2 id="premier-titre" className="premier-titre">
              <span lang="mg">Tongasoa !</span> <span lang="fr">Bienvenue !</span>
            </h2>
            <p className="premier-question">
              <span lang="mg">Fidio ny fiteny</span>
              <span lang="fr">Choisissez la langue</span>
            </p>
            <div className="premier-choix">
              <button type="button" className="bouton bouton-valider" lang="mg" onClick={() => changerLangue('mg')}>
                Malagasy
              </button>
              <button type="button" className="bouton bouton-neutre" lang="fr" onClick={() => changerLangue('fr')}>
                Français
              </button>
            </div>
          </>
        ) : (
          <>
            <span id="premier-titre" className="sr-only">
              {t('premier.lieu')}
            </span>
            <ChoixLieu titre={t('premier.lieu')} onChoisi={terminerAccueil} />
            <button type="button" className="bouton bouton-neutre bouton-plein" onClick={terminerAccueil}>
              {t('premier.plusTard')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
