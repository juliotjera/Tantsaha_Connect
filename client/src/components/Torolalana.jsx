import { BellRing, CloudSunRain, Lightbulb, NotebookPen } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { terminerTorolalana, usePreferences } from '../stockage/preferences'
import BoutonEcouter from './BoutonEcouter'

// Petit guide (« Torolalana ») juste après le premier lancement : les 4 rubriques,
// une par écran, avec un grand pictogramme, une phrase et le bouton Henoy.
// La démonstration guidée est ce qui aide le plus les personnes peu à l'aise
// avec la lecture lors du premier usage. On peut la passer, et la revoir dans « Fikirana ».
const ETAPES = [
  { id: 'toetrandro', Icone: CloudSunRain, rubrique: 'Toetrandro', rubriqueFr: 'Météo' },
  { id: 'fanairana', Icone: BellRing, rubrique: 'Fanairana', rubriqueFr: 'Alertes' },
  { id: 'rakitsoratra', Icone: NotebookPen, rubrique: 'Rakitsoratra', rubriqueFr: 'Journal' },
  { id: 'torohevitra', Icone: Lightbulb, rubrique: 'Torohevitra', rubriqueFr: 'Conseils' },
]

export default function Torolalana() {
  const { langueChoisie, accueilFini, torolalanaVue } = usePreferences()
  const { t, langue } = useT()
  const [numero, setNumero] = useState(0)
  const carte = useRef(null)
  const visible = langueChoisie && accueilFini && !torolalanaVue

  // le focus va dans la fenêtre à chaque étape (clavier, lecteur d'écran)
  useEffect(() => {
    if (visible) carte.current?.querySelector('.torolalana-suivant')?.focus()
  }, [visible, numero])

  if (!visible) return null
  const etape = ETAPES[numero]
  const derniere = numero === ETAPES.length - 1
  const texte = t(`torolalana.${etape.id}`)

  function suivant() {
    if (!derniere) return setNumero(numero + 1)
    setNumero(0)
    terminerTorolalana()
  }

  return (
    <div className="torolalana" role="dialog" aria-modal="true" aria-labelledby="torolalana-titre">
      <div className="premier-carte torolalana-carte" ref={carte}>
        <p className="torolalana-guide">{t('torolalana.titre')}</p>
        <div className="torolalana-etape" key={etape.id}>
          <span className="torolalana-icone" aria-hidden="true">
            <etape.Icone size={64} strokeWidth={1.8} />
          </span>
          <h2 id="torolalana-titre" className="premier-titre">
            {langue === 'fr' ? etape.rubriqueFr : etape.rubrique}
          </h2>
          <p className="torolalana-texte">{texte}</p>
          <BoutonEcouter id={`torolalana-${etape.id}`} texte={texte} />
        </div>

        {/* où en est-on : un point par étape */}
        <ol className="torolalana-points" aria-label={t('torolalana.etape', { n: numero + 1, total: ETAPES.length })}>
          {ETAPES.map((e, i) => (
            <li key={e.id} className={i === numero ? 'torolalana-point-actif' : ''} />
          ))}
        </ol>

        <div className="torolalana-actions">
          {!derniere && (
            <button type="button" className="bouton bouton-neutre" onClick={terminerTorolalana}>
              {t('torolalana.passer')}
            </button>
          )}
          <button type="button" className="bouton bouton-valider torolalana-suivant" onClick={suivant}>
            {t(derniere ? 'torolalana.vita' : 'torolalana.suivant')}
          </button>
        </div>
      </div>
    </div>
  )
}
