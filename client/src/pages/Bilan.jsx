import { BarChart3, Plus, Table2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { trouverType } from '../donnees/typesObservation'
import BoutonPartager from '../components/BoutonPartager'
import { useT } from '../i18n'
import { bilanParMois, TYPES_BILAN } from '../logique/bilan'
import { listerObservations, surModificationJournal } from '../stockage/journal'
import { aujourdhui, nomMois } from '../utils/dates'

// Bilan du journal (« Tatitra ») sur les 6 derniers mois :
// - en haut, le total de chaque type (semis, récoltes, pluie, parasites) ;
// - puis un petit graphique par type, tous sur la même échelle pour pouvoir
//   les comparer. Un graphique par type plutôt qu'un empilement : chacun ne
//   porte qu'une couleur, reconnue par son pictogramme et son nom, et reste
//   lisible par les daltoniens (vérifié avec l'outil de la skill dataviz) ;
// - un tableau donne les mêmes chiffres, pour qui préfère les lire.
export default function Bilan() {
  const { t, nom, langue } = useT()
  const [observations, setObservations] = useState(null)
  const [vue, setVue] = useState('graphique')

  useEffect(() => {
    const relire = () => listerObservations().then(setObservations)
    relire()
    return surModificationJournal(relire)
  }, [])

  if (observations === null) return null
  const bilan = bilanParMois(observations, aujourdhui())
  const maximum = Math.max(1, ...TYPES_BILAN.flatMap((type) => bilan.parType[type]))

  // rien sur 6 mois : pas de rangée de zéros, mais une invitation à noter
  if (bilan.total === 0) {
    return (
      <section className="journal-vide">
        <span className="rubrique-icone" aria-hidden="true">
          <BarChart3 size={72} strokeWidth={1.8} />
        </span>
        <p className="journal-vide-texte">{t('bilan.vide')}</p>
        <p className="journal-vide-detail">{t('bilan.videDetail')}</p>
        <Link to="/journal/vaovao" viewTransition className="bouton bouton-valider">
          <Plus size={26} strokeWidth={2.8} aria-hidden="true" /> {t('journal.premiere')}
        </Link>
      </section>
    )
  }

  return (
    <section className="bilan">
      <div className="bilan-entete">
        <p className="bilan-periode">{t('bilan.periode')}</p>
        <div className="bilan-actions">
          <BoutonPartager
            titre={`${t('app.nom')} : ${t('bilan.periode')}`}
            texte={TYPES_BILAN.map((type) => `${nom(trouverType(type))} : ${bilan.parType[type].reduce((a, b) => a + b, 0)}`).join('\n')}
          />
          <button type="button" className="bouton-discret" onClick={() => setVue(vue === 'graphique' ? 'tableau' : 'graphique')}>
            {vue === 'graphique' ? <Table2 size={20} aria-hidden="true" /> : <BarChart3 size={20} aria-hidden="true" />}
            {t(vue === 'graphique' ? 'bilan.voirTableau' : 'bilan.voirGraphique')}
          </button>
        </div>
      </div>

      <ul className="bilan-chiffres">
        {TYPES_BILAN.map((code) => {
          const type = trouverType(code)
          return (
            <li key={code} className="bilan-chiffre">
              <span className="bilan-chiffre-icone" aria-hidden="true">
                <type.Icone size={24} strokeWidth={2.4} />
              </span>
              <strong>{bilan.totaux[code]}</strong>
              <span>{nom(type)}</span>
            </li>
          )
        })}
      </ul>

      {bilan.total === 0 ? (
        <p className="bilan-vide">{t('bilan.vide')}</p>
      ) : vue === 'tableau' ? (
        <div className="bilan-tableau-cadre">
          <table className="bilan-tableau">
            <thead>
              <tr>
                <th scope="col">{t('bilan.mois')}</th>
                {TYPES_BILAN.map((code) => (
                  <th key={code} scope="col">
                    {nom(trouverType(code))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bilan.mois.map((mois, i) => (
                <tr key={mois}>
                  <th scope="row">{nomMois(mois, langue)}</th>
                  {TYPES_BILAN.map((code) => (
                    <td key={code}>{bilan.parType[code][i]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bilan-graphiques">
          {TYPES_BILAN.map((code) => (
            <GraphiqueType key={code} code={code} bilan={bilan} maximum={maximum} />
          ))}
        </div>
      )}
    </section>
  )
}

// Un petit histogramme : un mois par colonne. Un appui (ou le survol, ou le
// clavier) sur une colonne affiche sa valeur sous le graphique.
function GraphiqueType({ code, bilan, maximum }) {
  const { t, nom, langue } = useT()
  const type = trouverType(code)
  const valeurs = bilan.parType[code]
  const [choisi, setChoisi] = useState(null)
  const detail =
    choisi !== null ? t('bilan.valeur', { mois: nomMois(bilan.mois[choisi], langue), n: valeurs[choisi] }) : t('bilan.total', { n: bilan.totaux[code] })

  return (
    <figure className="bilan-graphique">
      <figcaption>
        <type.Icone size={22} strokeWidth={2.4} aria-hidden="true" className="bilan-graphique-icone" />
        <strong>{nom(type)}</strong>
        <span className="bilan-detail" aria-live="polite">
          {detail}
        </span>
      </figcaption>
      <div className="bilan-barres" onMouseLeave={() => setChoisi(null)}>
        {valeurs.map((valeur, i) => (
          <button
            key={bilan.mois[i]}
            type="button"
            className="bilan-colonne"
            aria-pressed={choisi === i}
            onClick={() => setChoisi(choisi === i ? null : i)}
            onMouseEnter={() => setChoisi(i)}
            onFocus={() => setChoisi(i)}
          >
            <span className="bilan-zone">
              {valeur > 0 ? (
                <span className="bilan-barre" style={{ height: `${(valeur / maximum) * 100}%` }}>
                  <span className="bilan-valeur">{valeur}</span>
                </span>
              ) : (
                <span className="sr-only">0</span>
              )}
            </span>
            <span className="bilan-mois">{nomMois(bilan.mois[i], langue, true)}</span>
          </button>
        ))}
      </div>
    </figure>
  )
}
