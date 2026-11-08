import { Share2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { partageFichierPossible, partagerFichier } from '../natif'
import { lirePhoto } from '../stockage/photos'

// Miniature de la photo d'une observation ; un appui l'affiche en grand,
// avec « Zarao » pour l'envoyer (au technicien, à la coopérative…).
export default function PhotoObservation({ idClient, description }) {
  const { t } = useT()
  const [photo, setPhoto] = useState(null) // { blob, url }
  const [ouverte, setOuverte] = useState(false)
  const fermer = useRef(null)

  useEffect(() => {
    let url = null
    let actif = true
    lirePhoto(idClient).then((blob) => {
      if (!actif || !blob) return
      url = URL.createObjectURL(blob)
      setPhoto({ blob, url })
    })
    return () => {
      actif = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [idClient])

  useEffect(() => {
    if (!ouverte) return
    fermer.current?.focus()
    const echap = (e) => e.key === 'Escape' && setOuverte(false)
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [ouverte])

  if (!photo) return null
  const fichier = new File([photo.blob], 'tantsaha-sary.jpg', { type: 'image/jpeg' })
  const partageable = partageFichierPossible(fichier)

  return (
    <>
      <button type="button" className="observation-photo" onClick={() => setOuverte(true)} aria-label={t('journal.voirPhoto', { quoi: description })}>
        <img src={photo.url} alt="" width="44" height="44" />
      </button>
      {ouverte && (
        <div className="visionneuse" role="dialog" aria-modal="true" aria-label={description} onClick={() => setOuverte(false)}>
          <img src={photo.url} alt={description} onClick={(e) => e.stopPropagation()} />
          <div className="visionneuse-actions" onClick={(e) => e.stopPropagation()}>
            {partageable && (
              <button type="button" className="bouton bouton-neutre" onClick={() => partagerFichier(fichier, description)}>
                <Share2 size={22} aria-hidden="true" /> {t('commun.partager')}
              </button>
            )}
            <button type="button" className="bouton bouton-valider" ref={fermer} onClick={() => setOuverte(false)}>
              <X size={22} aria-hidden="true" /> {t('commun.fermer')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
