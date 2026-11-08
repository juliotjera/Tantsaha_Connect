import { ALargeSmall, BellRing, ChevronRight, Compass, Download, FolderArchive, Info, Languages, MapPin, SunMoon, Upload, Volume2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BoutonInstaller from '../components/BoutonInstaller'
import { useT } from '../i18n'
import { partageFichierPossible, partagerFichier } from '../natif'
import { annoncer } from '../stockage/annonces'
import { useMeteo } from '../stockage/meteo'
import { fichierSauvegarde, importerSauvegarde } from '../stockage/sauvegarde'
import { aujourdhui } from '../utils/dates'
import { autorisation, demanderAutorisation } from '../stockage/notifications'
import { changerLangue, changerNotifications, changerSon, changerTaille, changerTheme, revoirTorolalana, usePreferences } from '../stockage/preferences'

// Paramètres (adaptabilité) : langue, taille du texte, apparence, notifications des dangers,
// lieu de la météo, installation sur le téléphone.
// Chaque choix est un grand bouton qui montre tout de suite son effet.
export default function Fikirana() {
  const { t, lieu } = useT()
  const { langue, taille, notifications, theme, son } = usePreferences()
  const meteo = useMeteo()
  const [permission, setPermission] = useState(autorisation)

  async function choisirNotifications(valeur) {
    if (valeur === 'oui') {
      const reponse = await demanderAutorisation() // le téléphone demande l'accord
      setPermission(reponse)
      changerNotifications(reponse === 'granted')
    } else {
      changerNotifications(false)
    }
  }

  return (
    <section className="fikirana">
      <Choix
        Icone={Languages}
        titre={t('fikirana.langue')}
        valeur={langue}
        options={[
          { valeur: 'mg', libelle: 'Malagasy', lang: 'mg' },
          { valeur: 'fr', libelle: 'Français', lang: 'fr' },
        ]}
        onChoisir={changerLangue}
      />

      {/* le lieu du champ, juste après la langue : c'est lui qui règle la météo et les alertes */}
      <Link to="/meteo" viewTransition className="fikirana-lien">
        <MapPin size={24} strokeWidth={2.4} aria-hidden="true" />
        <span>
          <strong>{t('fikirana.lieu')}</strong>
          <small>{meteo.lieu ? lieu(meteo.lieu) : t('fikirana.aucunLieu')}</small>
        </span>
        <ChevronRight size={22} aria-hidden="true" />
      </Link>
      <Choix
        Icone={ALargeSmall}
        titre={t('fikirana.taille')}
        valeur={taille}
        options={[
          { valeur: 'normal', libelle: t('fikirana.normal'), apercu: 'Aa' },
          { valeur: 'grand', libelle: t('fikirana.grand'), apercu: 'Aa', grand: true },
        ]}
        onChoisir={changerTaille}
      />
      <Choix
        Icone={SunMoon}
        titre={t('fikirana.theme')}
        valeur={theme}
        options={[
          { valeur: 'clair', libelle: t('fikirana.clair') },
          { valeur: 'soleil', libelle: t('fikirana.soleil') },
          { valeur: 'sombre', libelle: t('fikirana.sombre') },
        ]}
        onChoisir={changerTheme}
      />

      {permission === 'unsupported' ? null : (
        <Choix
          Icone={BellRing}
          titre={t('fikirana.notifications')}
          aide={permission === 'denied' ? t('fikirana.refusees') : t('fikirana.notifDetail')}
          valeur={notifications && permission === 'granted' ? 'oui' : 'non'}
          options={[
            { valeur: 'oui', libelle: t('fikirana.activees'), desactive: permission === 'denied' },
            { valeur: 'non', libelle: t('fikirana.desactivees') },
          ]}
          onChoisir={choisirNotifications}
        />
      )}

      <Choix
        Icone={Volume2}
        titre={t('fikirana.son')}
        aide={t('fikirana.sonDetail')}
        valeur={son ? 'oui' : 'non'}
        options={[
          { valeur: 'oui', libelle: t('fikirana.sonOui') },
          { valeur: 'non', libelle: t('fikirana.sonNon') },
        ]}
        onChoisir={(valeur) => changerSon(valeur === 'oui')}
      />

      <BoutonInstaller />

      <Tahiry />

      <div className="fikirana-liens">
        <button type="button" className="fikirana-lien" onClick={revoirTorolalana}>
          <Compass size={24} strokeWidth={2.4} aria-hidden="true" />
          <span>
            <strong>{t('fikirana.torolalana')}</strong>
            <small>{t('fikirana.torolalanaDetail')}</small>
          </span>
          <ChevronRight size={22} aria-hidden="true" />
        </button>

        <Link to="/mombamomba" viewTransition className="fikirana-lien">
          <Info size={24} strokeWidth={2.4} aria-hidden="true" />
          <span>
            <strong>{t('fikirana.apropos')}</strong>
          </span>
          <ChevronRight size={22} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

// Sauvegarde du journal : l'exporter dans un fichier (partagé, ou téléchargé
// sur ordinateur), ou importer un fichier exporté sur un autre téléphone
function Tahiry() {
  const { t } = useT()
  const champ = useRef(null)

  async function exporter() {
    const fichier = await fichierSauvegarde(aujourdhui())
    if (partageFichierPossible(fichier)) {
      partagerFichier(fichier, fichier.name)
      return
    }
    const lien = document.createElement('a')
    lien.href = URL.createObjectURL(fichier)
    lien.download = fichier.name
    lien.click()
    setTimeout(() => URL.revokeObjectURL(lien.href), 1000)
  }

  async function importer(evenement) {
    const fichier = evenement.target.files?.[0]
    evenement.target.value = ''
    if (!fichier) return
    try {
      const n = await importerSauvegarde(fichier)
      annoncer({ texte: t('fikirana.importes', { n }) })
    } catch {
      annoncer({ texte: t('fikirana.importErreur') })
    }
  }

  return (
    <fieldset className="fikirana-groupe">
      <legend>
        <FolderArchive size={22} strokeWidth={2.4} aria-hidden="true" /> {t('fikirana.tahiry')}
      </legend>
      <p className="fikirana-aide">{t('fikirana.tahiryDetail')}</p>
      <div className="fikirana-actions">
        <button type="button" className="bouton bouton-neutre" onClick={exporter}>
          <Download size={22} strokeWidth={2.4} aria-hidden="true" /> {t('fikirana.exporter')}
        </button>
        <button type="button" className="bouton bouton-neutre" onClick={() => champ.current?.click()}>
          <Upload size={22} strokeWidth={2.4} aria-hidden="true" /> {t('fikirana.importer')}
        </button>
        <input ref={champ} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={importer} />
      </div>
    </fieldset>
  )
}

// Groupe de boutons à choix unique (comme des boutons radio, mais grands)
function Choix({ Icone, titre, aide, valeur, options, onChoisir }) {
  return (
    <fieldset className="fikirana-groupe">
      <legend>
        <Icone size={22} strokeWidth={2.4} aria-hidden="true" /> {titre}
      </legend>
      {aide && <p className="fikirana-aide">{aide}</p>}
      <div className="fikirana-options">
        {options.map((o) => (
          <button
            key={o.valeur}
            type="button"
            className="fikirana-option"
            aria-pressed={valeur === o.valeur}
            disabled={o.desactive}
            lang={o.lang}
            onClick={() => onChoisir(o.valeur)}
          >
            {o.apercu && (
              <span className={`fikirana-apercu ${o.grand ? 'fikirana-apercu-grand' : ''}`} aria-hidden="true">
                {o.apercu}
              </span>
            )}
            {o.libelle}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
