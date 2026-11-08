import { Check, LocateFixed, X } from 'lucide-react'
import { useState } from 'react'
import { lieuLePlusProche, lieux } from '../donnees/lieux'
import { useT } from '../i18n'
import { choisirLieu, useMeteo } from '../stockage/meteo'

// Choix du lieu : par GPS (un appui) ou dans la liste des chefs-lieux de région,
// ceux des Hautes Terres d'abord ; le lieu actuel est coché.
// Utilisé par l'écran Météo et par le premier lancement.
export default function ChoixLieu({ titre, onFermer, onChoisi }) {
  const { t } = useT()
  const [gps, setGps] = useState('pret') // pret | recherche | refuse
  const actuel = useMeteo().lieu?.id
  const groupes = [
    { cle: 'lieu.hautesTerres', liste: lieux.filter((l) => l.hautesTerres) },
    { cle: 'lieu.autres', liste: lieux.filter((l) => !l.hautesTerres) },
  ]

  async function choisir(lieu) {
    await choisirLieu(lieu)
    onChoisi?.()
  }

  function localiser() {
    setGps('recherche')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const proche = lieuLePlusProche(coords.latitude, coords.longitude)
        choisir({
          id: 'gps',
          nom: proche.nom,
          pres: proche.nom, // affiché « près de … » dans la langue choisie
          lat: Math.round(coords.latitude * 100) / 100, // ~1 km : suffisant, et plus discret
          lon: Math.round(coords.longitude * 100) / 100,
        })
      },
      () => setGps('refuse'),
      { timeout: 15000, maximumAge: 60 * 60 * 1000 },
    )
  }

  return (
    <section className="choix-lieu">
      <div className="choix-lieu-entete">
        <h2 className="saisie-question">{titre ?? t('lieu.question')}</h2>
        {onFermer && (
          <button type="button" className="bouton-icone" onClick={onFermer} aria-label={t('commun.fermer')}>
            <X size={28} strokeWidth={2.6} aria-hidden="true" />
          </button>
        )}
      </div>

      {'geolocation' in navigator && (
        <button type="button" className="bouton bouton-valider bouton-plein" onClick={localiser} disabled={gps === 'recherche'}>
          <LocateFixed size={28} strokeWidth={2.6} aria-hidden="true" />
          {t(gps === 'recherche' ? 'lieu.recherche' : 'lieu.gps')}
        </button>
      )}
      {gps === 'refuse' && <p className="choix-lieu-aide">{t('lieu.refuse')}</p>}

      {groupes.map((groupe) => (
        <div key={groupe.cle} className="choix-lieu-groupe">
          <h3 className="choix-lieu-groupe-titre">{t(groupe.cle)}</h3>
          <ul className="choix-lieu-liste">
            {groupe.liste.map((lieu) => (
              <li key={lieu.id}>
                <button
                  type="button"
                  className={`choix-lieu-ville ${lieu.id === actuel ? 'choix-lieu-actuel' : ''}`}
                  aria-current={lieu.id === actuel ? 'true' : undefined}
                  onClick={() => choisir(lieu)}
                >
                  {lieu.id === actuel && <Check size={20} strokeWidth={2.8} aria-hidden="true" />}
                  {lieu.nom}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
