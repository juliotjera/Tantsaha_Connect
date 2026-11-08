import { BellRing, ChevronRight, MapPin, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import Almanach from '../components/Almanach'
import BoutonInstaller from '../components/BoutonInstaller'
import { couvertureDuMois } from '../donnees/photos'
import { typesObservation } from '../donnees/typesObservation'
import { useAlertes } from '../hooks/useAlertes'
import { useT } from '../i18n'
import { decrireTemps } from '../logique/meteo'
import { aujourdhui, formaterDate, jourSemaine } from '../utils/dates'

// Écran d'accueil, du plus urgent au plus général :
// 1. bonjour, date et temps actuel, sur la photo des rizières (un appui ouvre la météo)
// 2. l'alerte la plus importante, s'il y en a une
// 3. l'almanach : où en est l'année agricole, quand semer, quand récolter
// 4. noter ce qui s'est passé (semis, récolte, pluie, parasite) en un appui :
//    les rubriques, elles, sont dans la barre de navigation (pas de doublon)

export default function Accueil() {
  const { alertes, meteo, observations } = useAlertes()
  const { t, nom } = useT()
  const principale = alertes[0] // déjà triées : la plus grave en premier
  return (
    <section className="accueil">
      <Bienvenue meteo={meteo} />

      {principale && (
        <Link to="/alertes" viewTransition className={`bandeau-alerte bandeau-${principale.niveau}`}>
          <span className="bandeau-icone" aria-hidden="true">
            {principale.niveau === 'info' ? <BellRing size={22} strokeWidth={2.4} /> : <TriangleAlert size={22} strokeWidth={2.4} />}
          </span>
          <span className="bandeau-texte">
            <strong>{principale.titre}</strong>
            <small>{principale.detail}</small>
          </span>
          <ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      )}

      <Almanach observations={observations} />

      {/* l'action la plus fréquente, en un appui : noter ce qui s'est passé au champ */}
      <section className="noter" aria-labelledby="noter-titre">
        <h2 id="noter-titre" className="noter-titre">
          {t('accueil.noter')}
        </h2>
        <div className="noter-choix">
          {typesObservation.map((type) => (
            <Link key={type.code} to={`/journal/vaovao?type=${type.code}`} viewTransition className="noter-type" style={{ '--couleur': type.couleur }}>
              <span className="noter-icone" aria-hidden="true">
                <type.Icone size={30} strokeWidth={2.2} />
              </span>
              {nom(type)}
            </Link>
          ))}
        </div>
      </section>

      <BoutonInstaller />
    </section>
  )
}

// Bonjour + date + temps actuel du lieu choisi, sur une photo des Hautes Terres
// qui suit la saison agricole. Un voile sombre en bas garantit la lisibilité du texte.
function Bienvenue({ meteo }) {
  const { t, langue, nom, lieu } = useT()
  const date = aujourdhui()
  const couverture = couvertureDuMois(Number(date.slice(5, 7)))
  const actuel = meteo.previsions?.actuel
  const temps = actuel && decrireTemps(actuel.code, actuel.nuit)

  return (
    <Link to="/meteo" viewTransition className="bienvenue">
      {/* la photo suit la saison agricole ; petite sur téléphone (40 Ko), grande sur ordinateur (100 Ko) */}
      <img
        className="bienvenue-photo"
        src={couverture.src}
        srcSet={`${couverture.src.replace('.webp', '-640.webp')} 640w, ${couverture.src} 1024w`}
        sizes="(min-width: 960px) 900px, (min-width: 640px) 760px, 100vw"
        alt=""
        width="1024"
        height="640"
        fetchPriority="high"
      />
      <span className="bienvenue-texte">
        <span className="bienvenue-date">
          {jourSemaine(date, langue)} {formaterDate(date, langue)}
        </span>
        <span className="bienvenue-salut">{t('accueil.salut')}</span>
        {meteo.lieu && (
          <span className="bienvenue-lieu">
            <MapPin size={15} strokeWidth={2.4} aria-hidden="true" /> {lieu(meteo.lieu)}
          </span>
        )}
      </span>
      {temps ? (
        <span className="bienvenue-meteo" role="img" aria-label={t('accueil.meteo', { temps: nom(temps), degres: actuel.temperature })}>
          <span className="bienvenue-temperature">{actuel.temperature}°</span>
          <span className="bienvenue-temps">
            <temps.Icone size={20} strokeWidth={2.2} aria-hidden="true" /> {nom(temps)}
          </span>
        </span>
      ) : (
        meteo.pret &&
        !meteo.lieu && (
          <span className="bienvenue-meteo bienvenue-choisir">
            <MapPin size={18} strokeWidth={2.4} aria-hidden="true" /> {t('accueil.choisirLieu')}
          </span>
        )
      )}
    </Link>
  )
}
