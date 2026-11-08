import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Component } from 'react'
import { traduire } from '../i18n'
import { langueActuelle } from '../stockage/preferences'

// Filet de sécurité : si un écran plante (erreur imprévue), on affiche un
// message clair et un bouton pour relancer, au lieu d'une page blanche.
// Les données du journal sont dans IndexedDB : relancer ne perd rien.
export default class ErreurApplication extends Component {
  state = { erreur: null }

  static getDerivedStateFromError(erreur) {
    return { erreur }
  }

  componentDidCatch(erreur, info) {
    console.error('Erreur dans l’application', erreur, info.componentStack)
  }

  render() {
    if (!this.state.erreur) return this.props.children
    const t = (cle) => traduire(langueActuelle(), cle)
    return (
      <section className="erreur-app" role="alert">
        <span className="erreur-app-icone" aria-hidden="true">
          <TriangleAlert size={56} strokeWidth={2.2} />
        </span>
        <h2>{t('erreur.titre')}</h2>
        <p>{t('erreur.detail')}</p>
        <button type="button" className="bouton bouton-valider" onClick={() => window.location.assign('/')}>
          <RotateCcw size={26} strokeWidth={2.6} aria-hidden="true" /> {t('erreur.relancer')}
        </button>
      </section>
    )
  }
}
