import { CalendarDays, CloudSunRain, LayoutGrid, Sprout } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import BoutonEcouter from '../components/BoutonEcouter'
import BoutonPartager from '../components/BoutonPartager'
import { conseils } from '../donnees/conseils'
import { cultures } from '../donnees/cultures'
import { useT } from '../i18n'

// Conseils agricoles : un filtre à pictogrammes (tout, temps, calendrier, ou une culture),
// puis des fiches courtes à écouter. Une alerte peut ouvrir directement le
// conseil qui la concerne (/conseils?id=orana-mahery).
const FILTRES = [
  { id: 'tous', cle: 'conseils.tous', Icone: LayoutGrid, couleur: '#1f5c37' },
  { id: 'toetrandro', cle: 'conseils.temps', Icone: CloudSunRain, couleur: '#1f5c37' },
  { id: 'fotoana', cle: 'conseils.saisons', Icone: CalendarDays, couleur: '#1f5c37' },
  ...cultures.map((culture) => ({ id: culture.code, culture, Icone: culture.Icone, couleur: culture.couleur })),
]

const GROUPES = [
  { id: 'toetrandro', cle: 'conseils.temps', Icone: CloudSunRain, contient: (c) => c.theme === 'toetrandro' },
  { id: 'fotoana', cle: 'conseils.saisons', Icone: CalendarDays, contient: (c) => c.theme === 'fotoana' },
  { id: 'voly', cle: 'conseils.voly', Icone: Sprout, contient: (c) => !!c.cultureCode },
]

export default function Conseils() {
  const { t, nom } = useT()
  const [parametres, setParametres] = useSearchParams()
  const cible = parametres.get('id')
  const filtre = parametres.get('filtre') ?? 'tous'
  const ficheCible = useRef(null)

  const visibles = conseils.filter(
    (c) => cible === c.id || filtre === 'tous' || c.theme === filtre || c.cultureCode === filtre,
  )

  useEffect(() => {
    ficheCible.current?.scrollIntoView({ block: 'center' })
  }, [cible])

  return (
    <section className="conseils">
      <div className="filtres" role="radiogroup" aria-label={t('conseils.filtre')}>
        {FILTRES.map(({ id, cle, culture, Icone, couleur }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={filtre === id && !cible}
            className="filtre"
            style={{ '--couleur': couleur }}
            onClick={() => setParametres(id === 'tous' ? {} : { filtre: id }, { replace: true })}
          >
            <Icone size={26} strokeWidth={2.4} aria-hidden="true" />
            <span>{culture ? nom(culture) : t(cle)}</span>
          </button>
        ))}
      </div>

      {/* tout afficher : trois groupes avec un titre (temps, calendrier, cultures) */}
      {filtre === 'tous' && !cible ? (
        GROUPES.map((groupe) => (
          <section key={groupe.id} className="fiches-groupe" aria-labelledby={`groupe-${groupe.id}`}>
            <h2 id={`groupe-${groupe.id}`} className="fiches-groupe-titre">
              <groupe.Icone size={20} strokeWidth={2.4} aria-hidden="true" /> {t(groupe.cle)}
            </h2>
            <ListeFiches fiches={visibles.filter(groupe.contient)} />
          </section>
        ))
      ) : (
        <ListeFiches fiches={visibles} cible={cible} refCible={ficheCible} />
      )}
    </section>
  )
}

// Fiches : titre, texte court, Henoy ; la fiche d'une culture commence par sa photo
function ListeFiches({ fiches, cible, refCible }) {
  const { langue } = useT()
  return (
    <ul className="fiches">
      {fiches.map((c) => {
        const titre = langue === 'fr' ? c.titreFr : c.titre
        const texte = langue === 'fr' ? c.texteFr : c.texte
        return (
          <li
            key={c.id}
            ref={c.id === cible ? refCible : undefined}
            className={`fiche ${c.photo ? 'fiche-photo' : ''} ${c.id === cible ? 'fiche-cible' : ''}`}
          >
            {c.photo && <img className="fiche-image" src={c.photo} alt="" width="480" height="210" loading="lazy" />}
            <div className="fiche-entete">
              {!c.photo && (
                <span className="fiche-icone" aria-hidden="true">
                  <c.Icone size={36} strokeWidth={2.2} />
                </span>
              )}
              <h2 className="fiche-titre">{titre}</h2>
              <BoutonPartager titre={titre} texte={texte} />
            </div>
            <p className="fiche-texte">{texte}</p>
            <BoutonEcouter id={c.audio} texte={`${titre}. ${texte}`} />
          </li>
        )
      })}
    </ul>
  )
}
