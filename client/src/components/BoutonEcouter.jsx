import { Square, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { arreterVoixNatif, natif, parlerNatif } from '../natif'

// Bouton « Henoy » (écouter) : lit un message à voix haute, pour ceux qui
// ne lisent pas facilement.
// En malagasy :
// 1. enregistrement audio public/audio/<id>.mp3 (voix humaine ou synthèse préparée)
// 2. sinon, voix malagasy de synthèse du téléphone, s'il en a une
// En français : voix française du téléphone (présente sur presque tous les Android).
// Sans aucune voix disponible, le bouton est grisé.

const disponibles = new Map() // « langue:id » → Promise<'fichier' | 'synthese' | null>

const voix = (langue) =>
  window.speechSynthesis?.getVoices().find((v) => v.lang.toLowerCase().startsWith(langue === 'fr' ? 'fr' : 'mg'))

function verifier(id, langue) {
  const cle = `${langue}:${id}`
  if (!disponibles.has(cle)) {
    disponibles.set(
      cle,
      langue === 'fr'
        ? Promise.resolve(natif || 'speechSynthesis' in window ? 'synthese' : null)
        : // dans l'application, les fichiers sont lus depuis l'APK (qui ne répond pas à HEAD)
          fetch(`/audio/${id}.mp3`, { method: natif ? 'GET' : 'HEAD' })
            // un fichier absent peut renvoyer la page de l'application : on vérifie le type
            .then((r) => r.ok && r.headers.get('content-type')?.startsWith('audio/'))
            .catch(() => false)
            .then((fichier) => (fichier ? 'fichier' : voix('mg') ? 'synthese' : null)),
    )
    // un échec (réseau coupé, mise à jour de l'application) n'est pas définitif : on revérifiera
    disponibles.get(cle).then((source) => source === null && disponibles.delete(cle))
  }
  return disponibles.get(cle)
}

// Un seul message à la fois dans toute l'application
let arreterEnCours = null

export default function BoutonEcouter({ id, texte, petit = false }) {
  const { t, langue } = useT()
  // source vérifiée pour ce message dans cette langue ; undefined : vérification en cours
  const cle = `${langue}:${id}`
  const [verifie, setVerifie] = useState({ cle: null, source: undefined })
  const source = verifie.cle === cle ? verifie.source : undefined
  const [lecture, setLecture] = useState(false)
  const audio = useRef(null)

  useEffect(() => {
    let actif = true
    verifier(id, langue).then((s) => actif && setVerifie({ cle: `${langue}:${id}`, source: s }))
    return () => {
      actif = false
    }
  }, [id, langue])

  // arrêt de la lecture si on quitte l'écran
  useEffect(() => () => arreterEnCours?.(), [])

  function arreter() {
    audio.current?.pause()
    window.speechSynthesis?.cancel()
    if (natif) arreterVoixNatif()
    setLecture(false)
    arreterEnCours = null
  }

  function lire() {
    if (source === undefined) return // vérification en cours (quelques millisecondes)
    if (lecture) return arreter()
    arreterEnCours?.()
    arreterEnCours = arreter
    setLecture(true)

    if (source === 'fichier') {
      audio.current ??= new Audio(`/audio/${id}.mp3`)
      audio.current.currentTime = 0
      audio.current.onended = arreter
      audio.current.play().catch(arreter)
    } else if (natif) {
      parlerNatif(texte, langue).finally(arreter)
    } else {
      const phrase = new SpeechSynthesisUtterance(texte)
      phrase.voice = voix(langue) ?? null
      phrase.lang = langue === 'fr' ? 'fr-FR' : 'mg'
      phrase.rate = 0.9
      phrase.onend = arreter
      phrase.onerror = arreter
      window.speechSynthesis.speak(phrase)
    }
  }

  const indisponible = source === null
  const Icone = lecture ? Square : indisponible ? VolumeX : Volume2
  const libelle = t(lecture ? 'ecouter.arreter' : indisponible ? 'ecouter.aucune' : 'ecouter.lire')
  return (
    <button
      type="button"
      className={`bouton-ecouter ${petit ? 'bouton-ecouter-petit' : ''} ${lecture ? 'bouton-ecouter-actif' : ''}`}
      onClick={lire}
      disabled={indisponible}
      aria-label={petit ? libelle : undefined}
    >
      <Icone size={petit ? 22 : 26} strokeWidth={2.6} aria-hidden="true" fill={lecture ? 'currentColor' : 'none'} />
      {!petit && <span>{libelle}</span>}
    </button>
  )
}
