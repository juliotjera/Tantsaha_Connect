import { House } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { pagesAnnexes, rubriques } from '../donnees/rubriques'
import { useT } from '../i18n'
import Logo from './Logo'

// Navigation principale, toujours visible : on passe d'une rubrique à l'autre
// en un appui (flexibilité), et la rubrique en cours est mise en évidence par
// une pastille colorée autour de son pictogramme (guidage).
// Téléphone : barre en bas, à portée du pouce. Ordinateur : colonne à gauche,
// avec en bas les écrans annexes (paramètres, à propos).
const liens = [
  { id: 'accueil', chemin: '/', Icone: House, nom: 'Fandraisana', nomFr: 'Accueil', couleur: '#2e7d32' },
  ...rubriques,
]

export default function NavigationBas() {
  const { t, nom, langue } = useT()
  // barre de navigation : nom court quand il existe (« Journal » plutôt que « Journal de culture »)
  const nomNav = (lien) => (langue === 'fr' && lien.nomCourtFr) || nom(lien)
  return (
    <nav className="navigation" aria-label={t('navigation.principale')}>
      {/* nom de l'application, affiché seulement sur grand écran */}
      <span className="navigation-marque" aria-hidden="true">
        <Logo taille={40} />
        {t('app.nom')}
      </span>
      {liens.map((lien) => (
        <Lien key={lien.id} lien={lien} nom={nomNav(lien)} />
      ))}
      <span className="navigation-annexes">
        {pagesAnnexes.map((lien) => (
          <Lien key={lien.id} lien={lien} nom={nom(lien)} />
        ))}
      </span>
    </nav>
  )
}

function Lien({ lien: { chemin, Icone, couleur }, nom }) {
  return (
    <NavLink to={chemin} end={chemin === '/'} viewTransition className="navigation-lien" style={{ '--couleur': couleur }} aria-label={nom}>
      <span className="navigation-icone">
        <Icone size={26} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className="navigation-nom">{nom}</span>
    </NavLink>
  )
}
