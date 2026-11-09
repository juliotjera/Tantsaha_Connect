import { lazy, Suspense, useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Annonces from './components/Annonces'
import BandeauHorsLigne from './components/BandeauHorsLigne'
import EnTete from './components/EnTete'
import ErreurApplication from './components/ErreurApplication'
import MiseAJour from './components/MiseAJour'
import NavigationBas from './components/NavigationBas'
import PremierLancement from './components/PremierLancement'
import { rubriqueDe } from './donnees/rubriques'
import { useAlertes } from './hooks/useAlertes'
import { useT } from './i18n'
import Accueil from './pages/Accueil'
import { notifierDangers } from './stockage/notifications'
import { nettoyerPhotos } from './stockage/photos'
import { usePreferences } from './stockage/preferences'
import { demarrerSynchronisation } from './stockage/synchronisation'
import { aujourdhui } from './utils/dates'

// Les autres écrans ne sont chargés qu'à leur première ouverture : l'accueil
// s'affiche plus vite sur un réseau lent. Ils restent disponibles hors ligne
// (le service worker les garde tous en cache dès l'installation).
const Torolalana = lazy(() => import('./components/Torolalana'))
const Alertes = lazy(() => import('./pages/Alertes'))
const APropos = lazy(() => import('./pages/APropos'))
const Bilan = lazy(() => import('./pages/Bilan'))
const Confidentialite = lazy(() => import('./pages/Confidentialite'))
const Conseils = lazy(() => import('./pages/Conseils'))
const Fikirana = lazy(() => import('./pages/Fikirana'))
const Journal = lazy(() => import('./pages/Journal'))
const Meteo = lazy(() => import('./pages/Meteo'))
const NouvelleObservation = lazy(() => import('./pages/NouvelleObservation'))

// Structure de l'application : en-tête en haut, écran au milieu,
// barre de navigation en bas (comme une application mobile).
function App() {
  const { t } = useT()
  const { pathname } = useLocation()
  // couleur de la rubrique en cours : pictogramme du titre, écrans vides, choix
  const couleur = rubriqueDe(pathname)?.couleur

  // envoi automatique du journal à l'API dès qu'internet est disponible
  useEffect(() => demarrerSynchronisation(), [])
  useEffect(() => {
    nettoyerPhotos().catch(() => {}) // photos d'observations supprimées
  }, [])
  useChangementEcran()
  useNotificationsDangers()

  return (
    <div className="application" style={couleur ? { '--couleur': couleur } : undefined}>
      {/* clavier et lecteur d'écran : sauter directement au contenu */}
      <a className="lien-contenu" href="#contenu">
        {t('commun.allerContenu')}
      </a>
      <EnTete />
      <main className="contenu" id="contenu" tabIndex={-1}>
        <BandeauHorsLigne />
        <ErreurApplication>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Accueil />} />
              <Route path="/meteo" element={<Meteo />} />
              <Route path="/alertes" element={<Alertes />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/journal/vaovao" element={<NouvelleObservation />} />
              <Route path="/journal/tatitra" element={<Bilan />} />
              <Route path="/conseils" element={<Conseils />} />
              <Route path="/fikirana" element={<Fikirana />} />
              <Route path="/mombamomba" element={<APropos />} />
              <Route path="/mombamomba/tsiambaratelo" element={<Confidentialite />} />
              {/* adresse inconnue : retour à l'accueil plutôt qu'une page d'erreur */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErreurApplication>
      </main>
      <Annonces />
      <MiseAJour />
      <NavigationBas />
      <PremierLancement />
      <Suspense fallback={null}>
        <Torolalana />
      </Suspense>
    </div>
  )
}

// À chaque changement d'écran : titre de l'onglet à jour, et pour le clavier
// et les lecteurs d'écran, le focus va sur le titre du nouvel écran (qui est lu).
function useChangementEcran() {
  const { pathname } = useLocation()
  const { langue } = usePreferences()
  const premier = useRef(true)

  useEffect(() => {
    const titre = document.getElementById('titre-ecran')
    document.title = pathname === '/' ? 'Tantsaha Connect' : `${titre?.textContent} – Tantsaha Connect`
    if (premier.current) {
      premier.current = false // à l'ouverture, on ne déplace pas le focus
      return
    }
    titre?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [pathname, langue])
}

// Notifie les alertes de danger quand l'application n'est pas à l'écran
// (seulement si la personne a activé les notifications dans « Fikirana »)
function useNotificationsDangers() {
  const { alertes } = useAlertes()
  const { notifications } = usePreferences()

  useEffect(() => {
    if (!notifications) return
    const verifier = () => document.visibilityState === 'hidden' && notifierDangers(alertes, aujourdhui())
    verifier()
    document.addEventListener('visibilitychange', verifier)
    return () => document.removeEventListener('visibilitychange', verifier)
  }, [alertes, notifications])
}

export default App
