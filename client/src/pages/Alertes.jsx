import { BellRing, ChevronRight, CircleCheck, Lightbulb, MapPin, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import BoutonEcouter from '../components/BoutonEcouter'
import BoutonPartager from '../components/BoutonPartager'
import { useAlertes } from '../hooks/useAlertes'
import { useT } from '../i18n'

// Alertes : ce qui demande d'agir, le plus grave en haut.
// Rouge = danger, orange = vigilance, vert = rappel du calendrier ou rien à signaler.
export default function Alertes() {
  const { alertes, meteo } = useAlertes()
  const { t, lieu } = useT()

  if (!meteo.pret) return null

  return (
    <section className="alertes">
      {!meteo.lieu && (
        <Link to="/meteo" viewTransition className="alertes-lieu">
          <MapPin size={24} aria-hidden="true" /> {t('alertes.choisirLieu')}
        </Link>
      )}

      {alertes.every((a) => a.niveau === 'info') && alertes.length > 0 && (
        <p className="alertes-calme">
          <CircleCheck size={22} aria-hidden="true" /> {t('alertes.aucune')}
        </p>
      )}

      {alertes.length === 0 ? (
        <div className="alertes-rien">
          <span className="alertes-rien-icone" aria-hidden="true">
            <CircleCheck size={88} strokeWidth={2} />
          </span>
          <p className="alertes-rien-texte">{t('alertes.aucune')}</p>
          {meteo.lieu && (
            <p className="alertes-rien-detail">{t('alertes.periode', { lieu: lieu(meteo.lieu) })}</p>
          )}
        </div>
      ) : (
        <>
          {/* dangers et vigilances : grandes cartes, à lire et à écouter */}
          {alertes.some((a) => a.niveau !== 'info') && (
            <ul className="alertes-liste">
              {alertes
                .filter((a) => a.niveau !== 'info')
                .map((alerte) => (
                  <CarteAlerte key={alerte.id} alerte={alerte} />
                ))}
            </ul>
          )}
          {/* simples rappels du calendrier : lignes compactes, moins de poids visuel */}
          <Rappels rappels={alertes.filter((a) => a.niveau === 'info')} />
        </>
      )}
    </section>
  )
}

// Rappels (niveau info) : une ligne chacun, qui ouvre le conseil ; Henoy à côté
function Rappels({ rappels }) {
  const { t } = useT()
  if (rappels.length === 0) return null
  return (
    <section className="rappels" aria-labelledby="rappels-titre">
      <h2 id="rappels-titre" className="rappels-titre">
        <BellRing size={20} strokeWidth={2.4} aria-hidden="true" /> {t('alertes.rappels')}
      </h2>
      <ul className="rappels-liste">
        {rappels.map(({ id, Icone, Culture, titre, detail, conseil, audio }) => (
          <li key={id} className="rappel">
            <Link to={`/conseils?id=${conseil}`} viewTransition className="rappel-lien">
              <span className="alerte-icone rappel-icone" aria-hidden="true">
                <Icone size={28} strokeWidth={2.4} />
                {Culture && (
                  <span className="alerte-culture">
                    <Culture size={14} strokeWidth={2.6} />
                  </span>
                )}
              </span>
              <span className="rappel-texte">
                <strong>{titre}</strong>
                <small>{detail}</small>
              </span>
              <ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" className="rappel-chevron" />
            </Link>
            <BoutonEcouter id={audio} texte={`${titre}. ${detail}`} petit />
          </li>
        ))}
      </ul>
    </section>
  )
}

const ICONES_NIVEAU = { danger: TriangleAlert, vigilance: TriangleAlert, info: BellRing }

function CarteAlerte({ alerte }) {
  const { t } = useT()
  const { niveau, Icone, Culture, titre, detail, conseil, audio } = alerte
  const NiveauIcone = ICONES_NIVEAU[niveau]
  return (
    <li className={`alerte alerte-${niveau}`}>
      <div className="alerte-entete">
        <span className="alerte-icone" aria-hidden="true">
          <Icone size={40} strokeWidth={2.4} />
          {Culture && (
            <span className="alerte-culture">
              <Culture size={20} strokeWidth={2.6} />
            </span>
          )}
        </span>
        <div className="alerte-texte">
          <p className="alerte-niveau">
            <NiveauIcone size={16} strokeWidth={2.8} aria-hidden="true" />
            {t(`alertes.niveau.${niveau}`)}
          </p>
          <h2 className="alerte-titre">{titre}</h2>
          <p className="alerte-detail">{detail}</p>
        </div>
        <BoutonPartager titre={titre} texte={detail} />
      </div>
      <div className="alerte-actions">
        {/* message vocal malagasy préparé ; en français, lecture du texte affiché */}
        <BoutonEcouter id={audio} texte={`${titre}. ${detail}`} />
        <Link to={`/conseils?id=${conseil}`} viewTransition className="bouton bouton-neutre alerte-conseil">
          <Lightbulb size={24} strokeWidth={2.6} aria-hidden="true" /> {t('alertes.quoiFaire')}
        </Link>
      </div>
    </li>
  )
}
