import { BarChart3, NotebookPen, Plus, ShoppingBasket, Smartphone, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { trouverCulture } from '../donnees/cultures'
import { trouverType } from '../donnees/typesObservation'
import { useT } from '../i18n'
import { volyEnCours } from '../logique/voly'
import PhotoObservation from '../components/PhotoObservation'
import { annoncer } from '../stockage/annonces'
import { confirmer } from '../stockage/sons'
import {
  ajouterObservation,
  listerObservations,
  restaurerObservation,
  supprimerObservation,
  surModificationJournal,
} from '../stockage/journal'
import { aujourdhui, formaterDate, nomMois } from '../utils/dates'

// Journal de culture : la liste des observations enregistrées sur le téléphone,
// la plus récente en haut. Chaque ligne se lit sans texte : pictogramme du type,
// pictogramme de la culture, date ; une petite icône dit si elle est déjà envoyée.
// En haut, « Ny voliko » : les cultures en cours, avec leur avancement jusqu'à la récolte.
// Supprimer ou noter une récolte se fait en un appui, avec « Averina » (annuler)
// pendant quelques secondes : plus rapide qu'une confirmation, et sans risque.
export default function Journal() {
  const { t, nom, langue } = useT()
  const [observations, setObservations] = useState(null) // null : chargement en cours

  // relu à chaque modification (ajout, suppression, envoi au serveur)
  useEffect(() => {
    const relire = () => listerObservations().then(setObservations)
    relire()
    return surModificationJournal(relire)
  }, [])

  async function supprimer(observation) {
    await supprimerObservation(observation.idClient)
    navigator.vibrate?.(40)
    confirmer('supprime')
    const culture = observation.cultureCode && trouverCulture(observation.cultureCode)
    const quoi = [nom(trouverType(observation.type)), culture && nom(culture)].filter(Boolean).join(', ')
    annoncer({ texte: t('journal.supprime', { quoi }), annuler: () => restaurerObservation(observation) })
  }

  async function recolter(voly) {
    const recolte = await ajouterObservation({ type: 'recolte', cultureCode: voly.cultureCode, dateObservation: aujourdhui() })
    navigator.vibrate?.(80)
    confirmer('enregistre')
    annoncer({
      texte: t('journal.recolteNotee', { culture: nom(trouverCulture(voly.cultureCode)) }),
      annuler: () => supprimerObservation(recolte.idClient),
    })
  }

  if (observations === null) return null
  const voly = volyEnCours(observations, aujourdhui())

  return (
    <section className="journal">
      {observations.length > 0 && (
        <Link to="/journal/tatitra" viewTransition className="lien-bilan">
          <BarChart3 size={22} strokeWidth={2.4} aria-hidden="true" /> {t('journal.bilan')}
        </Link>
      )}

      {voly.length > 0 && <NyVoliko voly={voly} onRecolter={recolter} />}

      {observations.length === 0 ? (
        // écran vide : il invite à agir, avec un grand bouton (pas seulement un constat)
        <div className="journal-vide">
          <span className="rubrique-icone" aria-hidden="true">
            <NotebookPen size={72} strokeWidth={2} />
          </span>
          <p className="journal-vide-texte">{t('journal.vide')}</p>
          <p className="journal-vide-detail">{t('journal.videDetail')}</p>
          <Link to="/journal/vaovao" viewTransition className="bouton bouton-valider">
            <Plus size={28} strokeWidth={3} aria-hidden="true" /> {t('journal.premiere')}
          </Link>
        </div>
      ) : (
        // historique groupé par mois, le plus récent d'abord : on s'y retrouve d'un coup d'œil
        <div className="journal-mois-liste" aria-label={t('journal.liste')} role="group">
          {parMois(observations).map(({ cle, liste }) => (
            <section key={cle} className="journal-mois" aria-labelledby={`mois-${cle}`}>
              <h2 id={`mois-${cle}`} className="journal-mois-titre">
                {titreMois(cle, langue)}
              </h2>
              <ul className="journal-liste">
                {liste.map((observation) => (
                  <LigneObservation key={observation.idClient} observation={observation} langue={langue} onSupprimer={supprimer} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {observations.length > 0 && (
        <Link to="/journal/vaovao" viewTransition className="bouton-ajout" aria-label={t('journal.ajouterAria')}>
          <Plus size={34} strokeWidth={3} aria-hidden="true" />
          <span>{t('journal.ajouter')}</span>
        </Link>
      )}
    </section>
  )
}

// Cultures en cours : photo, barre d'avancement (semis → récolte), et
// un bouton « Nijinja » (j'ai récolté) dès que la récolte est possible
function NyVoliko({ voly, onRecolter }) {
  const { t, nom, langue } = useT()
  return (
    <section className="voliko" aria-labelledby="voliko-titre">
      <h2 id="voliko-titre" className="voliko-titre">
        {t('journal.voliko')}
      </h2>
      <ul className="voliko-liste">
        {voly.map((v) => {
          const culture = trouverCulture(v.cultureCode)
          const pret = v.etat !== 'croissance'
          const pourcentage = Math.round(v.progression * 100)
          return (
            <li key={v.semis.idClient} className={`voly ${pret ? 'voly-pret' : ''}`}>
              <img className="voly-photo" src={culture.photo} alt="" width="56" height="56" />
              <div className="voly-infos">
                <p className="voly-nom">
                  {nom(culture)}
                  <span className="voly-jours">{t('journal.jour', { n: v.jours })}</span>
                </p>
                <div
                  className="voly-barre"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pourcentage}
                  aria-label={`${nom(culture)} : ${pourcentage} %`}
                >
                  <span style={{ width: `${pourcentage}%` }} />
                </div>
                <p className="voly-recolte">
                  {pret ? t('journal.pret') : t('journal.recolteLe', { date: formaterDate(v.debutRecolte, langue) })}
                </p>
              </div>
              {pret && (
                <button
                  type="button"
                  className="voly-bouton"
                  onClick={() => onRecolter(v)}
                  aria-label={t('journal.recolterAria', { culture: nom(culture) })}
                >
                  <ShoppingBasket size={26} strokeWidth={2.4} aria-hidden="true" />
                  <span>{t('journal.recolter')}</span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function LigneObservation({ observation, langue, onSupprimer }) {
  const { t, nom } = useT()
  const type = trouverType(observation.type)
  const culture = observation.cultureCode && trouverCulture(observation.cultureCode)
  const etat = t(observation.synchronise ? 'journal.envoye' : 'journal.local')

  return (
    <li className="observation" style={{ '--couleur': type.couleur }}>
      <span className="observation-type" aria-hidden="true">
        <type.Icone size={34} strokeWidth={2.4} />
      </span>
      <span className="observation-texte">
        <span className="observation-titre">
          {nom(type)}
          {culture && (
            <span className="observation-culture">
              <culture.Icone size={20} strokeWidth={2.4} aria-hidden="true" /> {nom(culture)}
            </span>
          )}
        </span>
        <span className="observation-date">{formaterDate(observation.dateObservation, langue)}</span>
      </span>
      {observation.aPhoto && (
        <PhotoObservation idClient={observation.idClient} description={[nom(type), culture && nom(culture)].filter(Boolean).join(', ')} />
      )}
      {/* « envoyé » est l'état normal : annoncé au lecteur d'écran, pas affiché ;
          « pas encore envoyé » se voit (visibilité de l'état du système) */}
      {observation.synchronise ? (
        <span className="sr-only">{etat}</span>
      ) : (
        <span className="observation-etat" role="img" title={etat} aria-label={etat}>
          <Smartphone size={22} aria-hidden="true" />
        </span>
      )}
      <button type="button" className="observation-supprimer" onClick={() => onSupprimer(observation)} aria-label={t('journal.supprimer')}>
        <Trash2 size={22} aria-hidden="true" />
      </button>
    </li>
  )
}

// « AAAA-MM » → observations de ce mois (la liste est déjà triée, la plus récente d'abord)
function parMois(observations) {
  const groupes = []
  for (const observation of observations) {
    const cle = observation.dateObservation.slice(0, 7)
    if (groupes.at(-1)?.cle !== cle) groupes.push({ cle, liste: [] })
    groupes.at(-1).liste.push(observation)
  }
  return groupes
}

// « Novambra », ou « Desambra 2025 » pour une autre année
function titreMois(cle, langue) {
  const nom = nomMois(cle, langue)
  const titre = nom.charAt(0).toUpperCase() + nom.slice(1)
  return cle.slice(0, 4) === aujourdhui().slice(0, 4) ? titre : `${titre} ${cle.slice(0, 4)}`
}
