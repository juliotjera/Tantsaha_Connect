import { ArrowLeft, Settings, Wifi, WifiOff } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { rubriqueDe } from '../donnees/rubriques'
import { useEnAttente } from '../hooks/useEnAttente'
import { useEnLigne } from '../hooks/useEnLigne'
import { useT } from '../i18n'
import Logo from './Logo'

// Bandeau du haut, présent sur tous les écrans :
// - à gauche : le logo sur l'accueil, sinon un grand bouton de retour
//   (vers l'accueil depuis une rubrique, vers la rubrique depuis un sous-écran)
// - au centre : le pictogramme et le nom de l'écran en cours (guidage : on sait où l'on est)
// - à droite : l'état de la connexion, et le nombre d'observations pas encore
//   envoyées (visibilité de l'état du système : rien n'est perdu)
export default function EnTete() {
  const { pathname } = useLocation()
  const enLigne = useEnLigne()
  const enAttente = useEnAttente()
  const { t, nom } = useT()
  const rubrique = rubriqueDe(pathname)
  const sousEcran = rubrique && pathname !== rubrique.chemin
  const titre = rubrique ? nom(rubrique.sousEcrans?.[pathname] ?? rubrique) : t('app.nom')
  const etat = [t(enLigne ? 'connexion.oui' : 'connexion.non'), enAttente > 0 && t('connexion.attente', { n: enAttente })]
    .filter(Boolean)
    .join(', ')

  return (
    <header className="entete">
      {rubrique ? (
        <Link
          to={sousEcran ? rubrique.chemin : '/'}
          viewTransition
          className="entete-bouton"
          aria-label={sousEcran ? t('commun.retourVers', { nom: nom(rubrique) }) : t('commun.retourAccueil')}
        >
          <ArrowLeft size={28} strokeWidth={2.6} aria-hidden="true" />
        </Link>
      ) : (
        <Logo taille={40} className="entete-logo" />
      )}

      <h1 className={`entete-titre ${rubrique ? '' : 'entete-titre-accueil'}`} id="titre-ecran" tabIndex={-1}>
        {rubrique && <rubrique.Icone size={24} strokeWidth={2.4} aria-hidden="true" className="entete-titre-icone" />}
        <span className="entete-titre-texte">{titre}</span>
      </h1>

      <span className={`connexion ${enLigne ? 'connexion-oui' : 'connexion-non'}`} role="status" aria-label={etat} title={etat}>
        {enLigne ? <Wifi size={22} strokeWidth={2.6} aria-hidden="true" /> : <WifiOff size={22} strokeWidth={2.6} aria-hidden="true" />}
        <span className="connexion-texte">{t(enLigne ? 'connexion.ouiCourt' : 'connexion.nonCourt')}</span>
        {enAttente > 0 && (
          <span className="connexion-attente" aria-hidden="true">
            {enAttente}
          </span>
        )}
      </span>

      {/* paramètres : en haut à droite, comme dans les applications du téléphone */}
      {pathname !== '/fikirana' && (
        <Link to="/fikirana" viewTransition className="entete-bouton entete-fikirana" aria-label={t('fikirana.titre')} title={t('fikirana.titre')}>
          <Settings size={24} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      )}
    </header>
  )
}
