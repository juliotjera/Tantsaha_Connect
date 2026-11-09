import { Link } from 'react-router-dom'
import LienAndroid from '../components/LienAndroid'
import { photos } from '../donnees/photos'
import { useT } from '../i18n'

// « Mombamomba » (à propos) : à quoi sert l'application, et les crédits
// exigés par les licences des photos, des voix, des données et de la police.
const TEXTES = {
  mg: {
    intro: "Tantsaha Connect dia manampy ny tantsaha amin'ny toetrandro, ny fanairana, ny rakitsoratra ary ny torohevitra, na tsy misy internet aza.",
    photos: 'Sary',
    photosNote: "Sary malalaka avy amin'i Wikimedia Commons. Nohavaozina ny habeny sy ny lanjany ; ireo sary CC BY-SA dia mijanona amin'ny fahazoan-dalana mitovy.",
    par: 'Sary',
    source: 'loharano',
    autres: 'Loharano hafa',
    meteo: 'Toetrandro',
    voix: 'Feo malagasy vonjimaika',
    police: 'Endritsoratra',
    icones: 'Sary famantarana',
  },
  fr: {
    intro: 'Tantsaha Connect aide les paysans avec la météo, les alertes, le journal de culture et des conseils, même sans internet.',
    photos: 'Photos',
    photosNote: 'Photos libres de Wikimedia Commons, recadrées et compressées ; celles sous CC BY-SA restent sous la même licence.',
    par: 'Photo',
    source: 'source',
    autres: 'Autres sources',
    meteo: 'Météo',
    voix: 'Voix malagasy provisoires (synthèse)',
    police: 'Police',
    icones: 'Pictogrammes',
  },
}

export default function APropos() {
  const { t, langue } = useT()
  const T = TEXTES[langue]
  return (
    <section className="apropos">
      <p>{T.intro}</p>
      <p>
        <Link to="/mombamomba/tsiambaratelo" viewTransition>
          {t('apropos.confidentialite')}
        </Link>
      </p>

      <LienAndroid />

      <h2>{T.photos}</h2>
      <p>{T.photosNote}</p>
      <ul className="credits">
        {Object.values(photos).map((p) => (
          <li key={p.id} className="credit">
            <img src={p.src} alt="" width="64" height="48" />
            <p>
              {langue === 'fr' ? p.descriptionFr : p.description}. {T.par} : {p.auteur},{' '}
              <a href={p.lienLicence} target="_blank" rel="noreferrer">
                {p.licence}
              </a>
              ,{' '}
              <a href={p.source} target="_blank" rel="noreferrer">
                {T.source}
              </a>
            </p>
          </li>
        ))}
      </ul>

      <h2>{T.autres}</h2>
      <ul className="apropos-autres">
        <li>
          {T.meteo} :{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>{' '}
          (CC BY 4.0)
        </li>
        <li>
          {T.voix} :{' '}
          <a href="https://huggingface.co/facebook/mms-tts-mlg" target="_blank" rel="noreferrer">
            Meta MMS-TTS
          </a>{' '}
          (CC BY-NC 4.0)
        </li>
        <li>{T.police} : Atkinson Hyperlegible, Braille Institute (SIL Open Font License)</li>
        <li>
          {T.icones} :{' '}
          <a href="https://lucide.dev/" target="_blank" rel="noreferrer">
            Lucide
          </a>{' '}
          (ISC)
        </li>
      </ul>
    </section>
  )
}
