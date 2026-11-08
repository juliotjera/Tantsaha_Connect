import { Camera, Check, CircleCheck, Minus, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cultures, trouverCulture } from '../donnees/cultures'
import { trouverType, typesObservation } from '../donnees/typesObservation'
import { useT } from '../i18n'
import { ajouterObservation } from '../stockage/journal'
import { enregistrerPhoto, reduirePhoto } from '../stockage/photos'
import { confirmer } from '../stockage/sons'
import { ajouterJours, aujourdhui, formaterDate } from '../utils/dates'

// Nouvelle observation en 3 étapes courtes, une seule question par écran
// (charge de travail minimale) : 1. quoi ?  2. quelle culture ?  3. quand ?
// Rien à écrire : on ne fait que toucher de grands pictogrammes et photos.
export default function NouvelleObservation() {
  const { t, nom, langue } = useT()
  const navigate = useNavigate()
  // ouverte depuis l'accueil avec le type déjà choisi (?type=semis) : une étape de moins
  const [parametres] = useSearchParams()
  const typeDepart = trouverType(parametres.get('type'))?.code ?? null
  const [etape, setEtape] = useState(() =>
    typeDepart ? (trouverType(typeDepart).culture === 'aucune' ? 'date' : 'culture') : 'type',
  )
  const [type, setType] = useState(typeDepart)
  const [cultureCode, setCultureCode] = useState(null)
  const [date, setDate] = useState(aujourdhui)
  const [enregistre, setEnregistre] = useState(false)
  const [photo, setPhoto] = useState(null) // { blob, url } : photo facultative (parasite, maladie…)
  const champPhoto = useRef(null)

  const choixType = type && trouverType(type)
  const culture = cultureCode && trouverCulture(cultureCode)

  function choisirType(code) {
    setType(code)
    setCultureCode(null)
    setEtape(trouverType(code).culture === 'aucune' ? 'date' : 'culture')
  }

  function choisirCulture(code) {
    setCultureCode(code)
    setEtape('date')
  }

  async function choisirPhoto(evenement) {
    const fichier = evenement.target.files?.[0]
    evenement.target.value = '' // on peut reprendre la même photo
    if (!fichier) return
    const blob = await reduirePhoto(fichier).catch(() => null)
    if (blob) setPhoto((ancienne) => (ancienne && URL.revokeObjectURL(ancienne.url), { blob, url: URL.createObjectURL(blob) }))
  }

  // l'aperçu est libéré quand on quitte l'écran
  useEffect(() => () => photo && URL.revokeObjectURL(photo.url), [photo])

  async function enregistrer() {
    const observation = await ajouterObservation({ type, cultureCode, dateObservation: date, aPhoto: !!photo })
    if (photo) await enregistrerPhoto(observation.idClient, photo.blob)
    navigator.vibrate?.(80) // retour sensoriel, utile en plein soleil
    confirmer('enregistre') // carillon et « Voatahiry »
    setEnregistre(true)
  }

  // après la confirmation visuelle, retour automatique au journal
  useEffect(() => {
    if (!enregistre) return
    const minuteur = setTimeout(() => navigate('/journal', { replace: true, viewTransition: true }), 1300)
    return () => clearTimeout(minuteur)
  }, [enregistre, navigate])

  if (enregistre) {
    return (
      <section className="succes" role="status">
        <span className="succes-icone" aria-hidden="true">
          <CircleCheck size={96} strokeWidth={2.2} />
        </span>
        <p className="succes-texte">{t('saisie.enregistre')}</p>
      </section>
    )
  }

  // raccourcis de date : les cas les plus fréquents en un appui (brièveté)
  const raccourcis = [
    { cle: 'saisie.aujourdhui', valeur: aujourdhui() },
    { cle: 'saisie.hier', valeur: ajouterJours(aujourdhui(), -1) },
    { cle: 'saisie.semaine', valeur: ajouterJours(aujourdhui(), -7) },
  ]

  return (
    <section className="saisie">
      {/* rappel des choix déjà faits : un appui permet d'y revenir (contrôle utilisateur) */}
      <ol className="etapes" aria-label={t('saisie.etapes')}>
        <PuceEtape actif={etape === 'type'} fait={!!choixType} onClick={() => setEtape('type')} element={choixType} numero={1} libelle="saisie.etapeQuoi" />
        {choixType?.culture !== 'aucune' && (
          <PuceEtape
            actif={etape === 'culture'}
            fait={!!culture}
            onClick={choixType ? () => setEtape('culture') : undefined}
            element={culture}
            numero={2}
            libelle="saisie.etapeVoly"
          />
        )}
        <PuceEtape actif={etape === 'date'} fait={false} numero={choixType?.culture === 'aucune' ? 2 : 3} libelle="saisie.etapeDaty" />
      </ol>

      {etape === 'type' && (
        <>
          <h2 className="saisie-question">{t('saisie.quoi')}</h2>
          <div className="choix-grille">
            {typesObservation.map((typeObs) => (
              <button
                key={typeObs.code}
                type="button"
                className={`choix choix-large ${type === typeObs.code ? 'choix-selectionne' : ''}`}
                style={{ '--couleur': typeObs.couleur }}
                onClick={() => choisirType(typeObs.code)}
              >
                <span className="choix-icone" aria-hidden="true">
                  <typeObs.Icone size={48} strokeWidth={2.2} />
                </span>
                <span className="choix-nom">{nom(typeObs)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {etape === 'culture' && (
        <>
          <h2 className="saisie-question">{t('saisie.culture')}</h2>
          <div className="choix-grille">
            {cultures.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`choix choix-culture ${cultureCode === c.code ? 'choix-selectionne' : ''}`}
                onClick={() => choisirCulture(c.code)}
              >
                {/* vraie photo : reconnue sans lire, mieux qu'un dessin */}
                <img className="choix-photo" src={c.photo} alt="" width="480" height="360" />
                <span className="choix-nom">{nom(c)}</span>
              </button>
            ))}
          </div>
          {/* pour un parasite, la culture peut être inconnue ou concerner tout le champ */}
          {choixType.culture === 'facultative' && (
            <button type="button" className="bouton bouton-neutre bouton-plein" onClick={() => choisirCulture(null)}>
              {t('saisie.sansCulture')}
            </button>
          )}
        </>
      )}

      {etape === 'date' && (
        <>
          <h2 className="saisie-question">{t('saisie.quand')}</h2>
          <div className="date-raccourcis" role="group" aria-label={t('saisie.quand')}>
            {raccourcis.map(({ cle, valeur }) => (
              <button
                key={cle}
                type="button"
                className="date-raccourci"
                aria-pressed={date === valeur}
                onClick={() => setDate(valeur)}
              >
                {t(cle)}
              </button>
            ))}
          </div>
          <div className="date-choix">
            <button
              type="button"
              className="date-bouton"
              onClick={() => setDate((d) => ajouterJours(d, -1))}
              aria-label={t('saisie.precedent')}
            >
              <Minus size={34} strokeWidth={3} aria-hidden="true" />
            </button>
            <p className="date-valeur" aria-live="polite">
              {formaterDate(date, langue)}
            </p>
            <button
              type="button"
              className="date-bouton"
              onClick={() => setDate((d) => ajouterJours(d, 1))}
              disabled={date >= aujourdhui()} // pas de date dans le futur
              aria-label={t('saisie.suivant')}
            >
              <Plus size={34} strokeWidth={3} aria-hidden="true" />
            </button>
          </div>


          {/* photo facultative : l'appareil photo s'ouvre directement sur téléphone */}
          <input ref={champPhoto} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={choisirPhoto} />
          {photo ? (
            <div className="saisie-photo">
              <img src={photo.url} alt={t('saisie.photoApercu')} />
              <button type="button" className="bouton bouton-neutre" onClick={() => setPhoto(null)}>
                <X size={22} aria-hidden="true" /> {t('saisie.photoEsory')}
              </button>
            </div>
          ) : (
            <button type="button" className="bouton bouton-neutre bouton-plein" onClick={() => champPhoto.current?.click()}>
              <Camera size={26} strokeWidth={2.4} aria-hidden="true" /> {t('saisie.photo')}
            </button>
          )}

          <button type="button" className="bouton bouton-valider bouton-plein" onClick={enregistrer}>
            <Check size={32} strokeWidth={3} aria-hidden="true" /> {t('saisie.enregistrer')}
          </button>
        </>
      )}
    </section>
  )
}

function PuceEtape({ actif, fait, onClick, element, numero, libelle }) {
  const { t, nom } = useT()
  const contenu = element ? <element.Icone size={22} strokeWidth={2.6} aria-hidden="true" /> : numero
  return (
    <li>
      <button
        type="button"
        className={`puce ${actif ? 'puce-active' : ''} ${fait ? 'puce-faite' : ''}`}
        onClick={onClick}
        disabled={!onClick || actif}
        aria-current={actif ? 'step' : undefined}
        aria-label={element ? `${numero}. ${nom(element)}` : t('saisie.etape', { n: numero })}
      >
        {contenu}
      </button>
      {/* nom de l'étape, ou ce qui a été choisi */}
      <span className={`etape-nom ${actif ? 'etape-nom-active' : ''}`} aria-hidden="true">
        {element ? nom(element) : t(libelle)}
      </span>
    </li>
  )
}
