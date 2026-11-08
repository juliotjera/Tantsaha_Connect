import { ArrowDown, ArrowUp, Droplets, MapPin, RefreshCw, SprayCan, Sunrise, Sunset, Wind, WifiOff } from 'lucide-react'
import { useState } from 'react'
import ChoixLieu from '../components/ChoixLieu'
import { useEnLigne } from '../hooks/useEnLigne'
import { useT } from '../i18n'
import { decrireTemps, fenetreTraitement } from '../logique/meteo'
import { actualiser, useMeteo } from '../stockage/meteo'
import { dateLocale, formaterDate, formaterHeure, nomJour } from '../utils/dates'
import { formaterNombre, millimetres } from '../utils/nombres'

// Météo : le temps de maintenant en très grand, les 24 prochaines heures (avec le bon
// moment pour traiter les cultures), puis les 7 prochains jours.
// Chaque jour se lit sans texte : pictogramme du temps, goutte + mm de pluie.
export default function Meteo() {
  const { t, lieu } = useT()
  const meteo = useMeteo()
  const [choixOuvert, setChoixOuvert] = useState(false)

  if (!meteo.pret) return null
  if (!meteo.lieu || choixOuvert) {
    const fermer = () => setChoixOuvert(false)
    return <ChoixLieu onFermer={meteo.lieu ? fermer : undefined} onChoisi={fermer} />
  }

  return (
    <section className="meteo">
      <button
        type="button"
        className="meteo-lieu"
        onClick={() => setChoixOuvert(true)}
      >
        <MapPin size={24} strokeWidth={2.6} aria-hidden="true" />
        <span>{lieu(meteo.lieu)}</span>
        <span className="meteo-lieu-changer">{t('meteo.changer')}</span>
      </button>

      {meteo.previsions ? (
        <>
          <Actuel previsions={meteo.previsions} />
          <Heures heures={meteo.previsions.heures} />
          <Semaine jours={meteo.previsions.jours} />
        </>
      ) : meteo.chargement ? (
        <Squelette />
      ) : (
        <p className="meteo-attente">{t('meteo.aucune')}</p>
      )}

      <EtatMiseAJour meteo={meteo} />
    </section>
  )
}

function Actuel({ previsions }) {
  const { t, nom } = useT()
  const { actuel } = previsions
  const aujourdhui = previsions.jours[0]
  const temps = decrireTemps(actuel.code, actuel.nuit)
  return (
    <div className="meteo-actuel" style={{ '--couleur': temps.couleur }}>
      <div className="meteo-actuel-haut">
        <div>
          <p className="meteo-temperature">{actuel.temperature}°</p>
          <p className="meteo-nom">{nom(temps)}</p>
          <p className="meteo-extremes">
            <ArrowUp size={18} strokeWidth={2.8} aria-label={t('meteo.max')} /> {aujourdhui.tmax}°
            <ArrowDown size={18} strokeWidth={2.8} aria-label={t('meteo.min')} /> {aujourdhui.tmin}°
          </p>
        </div>
        <temps.Icone size={112} strokeWidth={1.6} aria-hidden="true" className="meteo-actuel-icone" />
      </div>
      <div className="meteo-details">
        <p className="meteo-detail">
          <Droplets size={22} aria-label={t('meteo.pluie')} />
          <strong>{millimetres(aujourdhui.pluie)}</strong>
          <small>{aujourdhui.probaPluie}%</small>
        </p>
        <p className="meteo-detail">
          <Wind size={22} aria-label={t('meteo.vent')} />
          <strong>{actuel.vent}</strong>
          <small>km/h</small>
        </p>
        {/* lever et coucher du soleil : la journée de travail aux champs */}
        {aujourdhui.lever && (
          <>
            <p className="meteo-detail meteo-detail-soleil">
              <Sunrise size={22} aria-label={t('meteo.lever')} />
              <strong>{aujourdhui.lever}</strong>
            </p>
            <p className="meteo-detail meteo-detail-soleil">
              <Sunset size={22} aria-label={t('meteo.coucher')} />
              <strong>{aujourdhui.coucher}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// 24 prochaines heures, à faire défiler du doigt ; les heures du bon moment pour
// traiter (pulvériser) sont soulignées en vert, et la période est écrite dessous
function Heures({ heures }) {
  const { t, nom } = useT()
  if (!heures?.length) return null // prévisions gardées par une version précédente
  const fenetre = fenetreTraitement(heures)
  const etiquette = (iso) => t('meteo.heure', { h: Number(iso.slice(11, 13)) })
  const premierJour = heures[0].heure.slice(0, 10)
  const plage = fenetre && {
    jour: fenetre.debut.slice(0, 10) !== premierJour ? `${t('meteo.demain')} ` : '',
    debut: etiquette(fenetre.debut),
    fin: t('meteo.heure', { h: (Number(fenetre.fin.slice(11, 13)) + 1) % 24 }),
  }

  return (
    <section className="meteo-heures" aria-labelledby="meteo-heures-titre">
      <h2 id="meteo-heures-titre" className="meteo-section-titre">
        {t('meteo.heures')}
      </h2>
      {/* focusable : on la fait défiler au clavier avec les flèches */}
      <ol className="heures" tabIndex={0} aria-labelledby="meteo-heures-titre">
        {heures.map((h, i) => {
          const temps = decrireTemps(h.code, h.nuit)
          const traitement = fenetre && i >= fenetre.indices[0] && i <= fenetre.indices[1]
          const libelle = i === 0 ? t('meteo.maintenant') : etiquette(h.heure)
          return (
            <li
              key={h.heure}
              className={`heure ${traitement ? 'heure-traitement' : ''}`}
              style={{ '--couleur': temps.couleur }}
              aria-label={t('meteo.heureDetail', { heure: libelle, temps: nom(temps), degres: h.temperature, proba: h.probaPluie })}
            >
              <span className="heure-nom" aria-hidden="true">
                {libelle}
              </span>
              <temps.Icone size={26} strokeWidth={2.2} aria-hidden="true" className="heure-icone" />
              <strong aria-hidden="true">{h.temperature}°</strong>
              <span className="heure-pluie" aria-hidden="true">
                {h.probaPluie >= 20 && (
                  <>
                    <Droplets size={12} strokeWidth={2.6} /> {h.probaPluie}%
                  </>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      <p className={`traitement ${fenetre ? '' : 'traitement-non'}`}>
        <span className="traitement-icone" aria-hidden="true">
          <SprayCan size={24} strokeWidth={2.2} />
        </span>
        {fenetre ? (
          <span>
            <strong>
              {t('meteo.traitement')}
              {plage.jour && <span className="traitement-jour">{plage.jour.trim()}</span>}
            </strong>
            {/* l'heure en grand, lisible d'un coup d'œil ; la phrase complète pour le lecteur d'écran */}
            <span className="traitement-plage" aria-hidden="true">
              {plage.debut} – {plage.fin}
            </span>
            <span className="sr-only">{t('meteo.traitementPlage', { debut: plage.debut, fin: plage.fin })}</span>
            <small>{t('meteo.traitementDetail')}</small>
          </span>
        ) : (
          <span>{t('meteo.traitementAucun')}</span>
        )}
      </p>
    </section>
  )
}

// 7 jours ; chaque barre montre l'écart entre la nuit la plus fraîche et
// l'après-midi le plus chaud de la semaine (comparaison d'un coup d'œil)
function Semaine({ jours }) {
  const { t } = useT()
  const min = Math.min(...jours.map((j) => j.tmin))
  const max = Math.max(...jours.map((j) => j.tmax))
  return (
    <ul className="meteo-jours" aria-label={t('meteo.semaine')}>
      {jours.map((jour) => (
        <Jour key={jour.date} jour={jour} min={min} etendue={Math.max(1, max - min)} />
      ))}
    </ul>
  )
}

function Jour({ jour, min, etendue }) {
  const { t, nom, langue } = useT()
  const temps = decrireTemps(jour.code)
  return (
    <li className="meteo-jour" style={{ '--couleur': temps.couleur }}>
      <span className="meteo-jour-nom">
        {nomJour(jour.date, langue)}
        <small>{formaterDate(jour.date, langue)}</small>
      </span>
      <temps.Icone size={32} strokeWidth={2.2} aria-label={nom(temps)} role="img" className="meteo-jour-icone" />
      <span className={`meteo-jour-pluie ${jour.pluie >= 1 ? '' : 'meteo-jour-sec'}`}>
        <Droplets size={16} aria-label={t('meteo.pluie')} />
        {formaterNombre(jour.pluie)}
      </span>
      <span className="meteo-jour-temp">
        <span className="meteo-jour-min">{jour.tmin}°</span>
        <span className="meteo-plage" role="img" aria-label={t('meteo.plage', { min: jour.tmin, max: jour.tmax })}>
          <span
            style={{
              left: `${((jour.tmin - min) / etendue) * 100}%`,
              right: `${100 - ((jour.tmax - min) / etendue) * 100}%`,
            }}
          />
        </span>
        <strong>{jour.tmax}°</strong>
      </span>
    </li>
  )
}

// Pendant le premier téléchargement : la forme de l'écran, sans attendre de texte
function Squelette() {
  const { t } = useT()
  return (
    <div className="squelette" role="status" aria-label={t('meteo.chargement')}>
      {/* carte du temps actuel : température, nom du temps, deux mesures, pictogramme */}
      <span className="squelette-carte">
        <span className="squelette-colonne">
          <span className="squelette-bloc squelette-temperature" />
          <span className="squelette-bloc squelette-texte" />
          <span className="squelette-bloc squelette-texte squelette-court" />
        </span>
        <span className="squelette-bloc squelette-rond" />
        <span className="squelette-bloc squelette-mesure" />
        <span className="squelette-bloc squelette-mesure" />
      </span>
      {/* liste des jours : nom, pictogramme, températures */}
      <span className="squelette-liste">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="squelette-jour">
            <span className="squelette-bloc squelette-texte" />
            <span className="squelette-bloc squelette-picto" />
            <span className="squelette-bloc squelette-barre" />
          </span>
        ))}
      </span>
    </div>
  )
}

// Visibilité de l'état : on sait toujours de quand datent les prévisions
function EtatMiseAJour({ meteo }) {
  const { t, langue } = useT()
  const enLigne = useEnLigne()
  return (
    <div className="meteo-etat" role="status">
      {!enLigne && <WifiOff size={20} aria-label={t('connexion.non')} />}
      <span>
        {meteo.recupereLe &&
          t('meteo.majLe', { date: formaterDate(dateLocale(meteo.recupereLe), langue), heure: formaterHeure(meteo.recupereLe) })}
        {meteo.erreur && enLigne && `. ${t('meteo.echec')}`}
      </span>
      {enLigne && (
        <button
          type="button"
          className="meteo-actualiser"
          onClick={() => actualiser({ force: true })}
          disabled={meteo.chargement}
          aria-label={t('meteo.actualiser')}
        >
          <RefreshCw size={24} className={meteo.chargement ? 'tourne' : undefined} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
