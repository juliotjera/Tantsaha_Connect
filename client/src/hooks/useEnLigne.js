import { useEffect, useState } from 'react'

// Indique si le téléphone a accès à internet, et se met à jour tout seul
// quand la connexion apparaît ou disparaît (événements online / offline).
// Sert à respecter l'heuristique « visibilité de l'état du système ».
export function useEnLigne() {
  const [enLigne, setEnLigne] = useState(navigator.onLine)

  useEffect(() => {
    const enLigneOui = () => setEnLigne(true)
    const enLigneNon = () => setEnLigne(false)
    window.addEventListener('online', enLigneOui)
    window.addEventListener('offline', enLigneNon)
    return () => {
      window.removeEventListener('online', enLigneOui)
      window.removeEventListener('offline', enLigneNon)
    }
  }, [])

  return enLigne
}
