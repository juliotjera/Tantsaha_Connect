import { CalendarRange, ChevronDown, CloudRain, ShoppingBasket, Sprout, Sun, Wheat } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BoutonEcouter from './BoutonEcouter'
import { trouverCulture } from '../donnees/cultures'
import { useT } from '../i18n'
import { ceMois, lignesAlmanach, saisonDuMois } from '../logique/almanach'
import { aujourdhui, nomMois } from '../utils/dates'

// « Ity volana ity » (ce mois-ci), sur l'accueil : la seule question qui compte
// d'abord, « que faire maintenant ? », en deux rangées de photos :
// - les cultures à semer ce mois (calendrier cultural) ;
// - mes cultures en cours, prêtes à récolter (« Izao ») ou la date de récolte.
// Henoy lit ce mois à voix haute. L'année entière (grille des 12 mois) reste
// disponible derrière un bouton, pour qui veut voir plus loin.
const SAISONS = { fahavaratra: CloudRain, ririnina: Sun }
const majuscule = (texte) => texte.charAt(0).toUpperCase() + texte.slice(1)

export default function Almanach({ observations }) {
  const { t, nom, langue } = useT()
  const [anneeOuverte, setAnneeOuverte] = useState(false)
  const { cle, saison, aSemer, recoltes } = ceMois(observations, aujourdhui())
  const IconeSaison = SAISONS[saison]
  const dateCourte = (date) => `${Number(date.slice(8, 10))} ${nomMois(date.slice(0, 7), langue, true).replace('.', '')}`
  const liste = (codes) => codes.map((code) => nom(trouverCulture(code))).join(', ')

  // ce qui est lu par Henoy (voix du téléphone en français ; message préparé en malagasy)
  const resume = [
    aSemer.length ? `${t('almanach.afafy')} : ${liste(aSemer)}` : t('almanach.tsyMisyAfafy'),
    recoltes.length > 0 &&
      `${t('almanach.jinjao')} : ${recoltes
        .map((r) => `${nom(trouverCulture(r.code))} ${r.pret ? t('almanach.izao') : dateCourte(r.date)}`)
        .join(', ')}`,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <section className="almanach" aria-labelledby="almanach-titre">
      <div className="almanach-entete">
        <div>
          <h2 id="almanach-titre">{t('almanach.ceMois')}</h2>
          <p className={`almanach-saison almanach-saison-${saison}`}>
            <IconeSaison size={16} strokeWidth={2.4} aria-hidden="true" /> {majuscule(nomMois(cle, langue))}, {t(`almanach.${saison}`).toLowerCase()}
          </p>
        </div>
        <BoutonEcouter id={`almanach-volana-${cle.slice(5, 7)}`} texte={resume} petit />
      </div>

      <div className="almanach-rangee">
        <h3 className="almanach-rangee-titre">
          <span className="almanach-picto almanach-picto-semis" aria-hidden="true">
            <Sprout size={18} strokeWidth={2.4} />
          </span>
          {t('almanach.afafy')}
        </h3>
        {aSemer.length > 0 ? (
          <ul className="almanach-voly">
            {aSemer.map((code) => {
              const culture = trouverCulture(code)
              return (
                <li key={code}>
                  <Link to={`/conseils?filtre=${code}`} viewTransition className="almanach-puce">
                    <img src={culture.photo} alt="" width="40" height="40" />
                    {nom(culture)}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="almanach-vide">{t('almanach.tsyMisyAfafy')}</p>
        )}
      </div>

      <div className="almanach-rangee">
        <h3 className="almanach-rangee-titre">
          <span className="almanach-picto almanach-picto-recolte" aria-hidden="true">
            <ShoppingBasket size={18} strokeWidth={2.4} />
          </span>
          {t('almanach.jinjao')}
        </h3>
        {recoltes.length > 0 ? (
          <ul className="almanach-voly">
            {recoltes.map((r) => {
              const culture = trouverCulture(r.code)
              return (
                <li key={r.code}>
                  <Link to="/journal" viewTransition className="almanach-puce">
                    <img src={culture.photo} alt="" width="40" height="40" />
                    <span>
                      {nom(culture)}
                      {r.pret ? <span className="almanach-pret">{t('almanach.izao')}</span> : <small>{dateCourte(r.date)}</small>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="almanach-vide">{t('almanach.aucuneRecolte')}</p>
        )}
      </div>

      <button
        type="button"
        className="almanach-annee-bouton"
        aria-expanded={anneeOuverte}
        aria-controls="almanach-annee"
        onClick={() => setAnneeOuverte(!anneeOuverte)}
      >
        <CalendarRange size={20} strokeWidth={2.4} aria-hidden="true" />
        {t(anneeOuverte ? 'almanach.anneeMasquer' : 'almanach.annee')}
        <ChevronDown size={20} strokeWidth={2.4} aria-hidden="true" className="almanach-chevron" />
      </button>
      {anneeOuverte && <GrilleAnnee observations={observations} />}
    </section>
  )
}

// L'année entière, faite pour être lue sans effort :
// - une barre continue par période (de novembre à décembre = une seule barre),
//   verte pour semer, ocre bordée en dessous pour la récolte prévue ;
// - sous le nom de chaque culture, ses mois de semis écrits en clair (« Nov – Des ») ;
// - les deux saisons écrites dans la bande du haut, avec leur pictogramme ;
// - le mois en cours en pastille sombre, première colonne.
// Couleur ET position distinguent semis et récolte (lisible par les daltoniens).
function GrilleAnnee({ observations }) {
  const { t, nom, langue } = useT()
  const { mois, lignes, toutes } = lignesAlmanach(observations, aujourdhui())
  const abrege = (cle) => majuscule(nomMois(cle, langue, true).replace('.', ''))
  const listeMois = (cles) => cles.map((cle) => nomMois(cle, langue)).join(', ')
  const plages = (liste) =>
    liste.map((p) => (p.debut === p.fin ? abrege(mois[p.debut]) : `${abrege(mois[p.debut])} – ${abrege(mois[p.fin])}`)).join(', ')
  const colonnes = (p) => ({ gridColumn: `${p.debut + 2} / ${p.fin + 3}` })
  const saisons = periodes(mois.map((cle) => saisonDuMois(Number(cle.slice(5, 7)))))
  const avecRecolte = lignes.some((l) => l.mois.some((m) => m.recolte))

  return (
    <div className="almanach-annee" id="almanach-annee">
      <div className="almanach-annee-entete">
        <p>{t('almanach.titre')}</p>
        <BoutonEcouter id="almanach" texte={t('almanach.explication')} petit />
      </div>

      <div className="almanach-grille" style={{ '--colonnes': mois.length }}>
        {/* mois : le premier est le mois en cours */}
        <span className="almanach-coin" aria-hidden="true" />
        {mois.map((cle, i) => (
          <span key={cle} className={`almanach-mois ${i === 0 ? 'almanach-mois-actuel' : ''}`} aria-hidden="true" title={nomMois(cle, langue)}>
            {/* initiale sur téléphone (12 colonnes étroites), abréviation dès qu'il y a la place */}
            <span className="almanach-initiale">{nomMois(cle, langue, true).charAt(0).toUpperCase()}</span>
            <span className="almanach-abrege">{abrege(cle)}</span>
          </span>
        ))}

        {/* saisons, écrites dans la bande */}
        <span className="almanach-coin" aria-hidden="true" />
        {saisons.map((p) => {
          const IconeSaison = SAISONS[p.valeur]
          return (
            <span key={p.debut} className={`almanach-saison-bande almanach-bande-${p.valeur}`} style={colonnes(p)} aria-hidden="true">
              <IconeSaison size={14} strokeWidth={2.6} />
              {p.fin - p.debut >= 2 && <span>{t(`almanach.${p.valeur}`)}</span>}
            </span>
          )
        })}

        {/* une ligne par culture : un appui ouvre ses conseils */}
        {lignes.map((ligne) => {
          const culture = trouverCulture(ligne.code)
          const semis = periodes(ligne.mois.map((m) => m.semis))
          const recolte = periodes(ligne.mois.map((m) => m.recolte))
          const resume = [
            nom(culture),
            semis.length && `${t('almanach.semis')} : ${listeMois(ligne.mois.filter((m) => m.semis).map((m) => m.cle))}`,
            recolte.length && `${t('almanach.recolte')} : ${listeMois(ligne.mois.filter((m) => m.recolte).map((m) => m.cle))}`,
          ]
            .filter(Boolean)
            .join('. ')
          return (
            <Link key={ligne.code} to={`/conseils?filtre=${ligne.code}`} viewTransition className="almanach-ligne" aria-label={resume}>
              <span className="almanach-culture">
                <img src={culture.photo} alt="" width="28" height="28" />
                <span>
                  {nom(culture)}
                  {semis.length > 0 && <small>{plages(semis)}</small>}
                </span>
              </span>
              {semis.map((p) => (
                <span key={`s${p.debut}`} className="almanach-barre almanach-barre-semis" style={colonnes(p)} aria-hidden="true" />
              ))}
              {recolte.map((p) => (
                <span key={`r${p.debut}`} className="almanach-barre almanach-barre-recolte" style={colonnes(p)} aria-hidden="true" />
              ))}
            </Link>
          )
        })}
      </div>

      <ul className="almanach-legende">
        <li>
          <span className="almanach-picto almanach-picto-semis" aria-hidden="true">
            <Sprout size={16} strokeWidth={2.4} />
          </span>
          <span className="almanach-cle almanach-barre-semis" aria-hidden="true" /> {t('almanach.semis')}
        </li>
        {/* la récolte n'apparaît que pour les cultures en cours : légende seulement si elle est visible */}
        {avecRecolte && (
          <li>
            <span className="almanach-picto almanach-picto-recolte" aria-hidden="true">
              <Wheat size={16} strokeWidth={2.4} />
            </span>
            <span className="almanach-cle almanach-barre-recolte" aria-hidden="true" /> {t('almanach.recolte')}
          </li>
        )}
      </ul>
      {toutes && <p className="almanach-note">{t('almanach.noteCourte')}</p>}
    </div>
  )
}

// Suites de valeurs vraies (ou identiques) : [{ debut, fin, valeur }], indices compris
function periodes(valeurs) {
  const liste = []
  valeurs.forEach((valeur, i) => {
    if (!valeur) return
    const derniere = liste.at(-1)
    if (derniere && derniere.fin === i - 1 && derniere.valeur === valeur) derniere.fin = i
    else liste.push({ debut: i, fin: i, valeur })
  })
  return liste
}
