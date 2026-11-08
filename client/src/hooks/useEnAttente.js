import { useEffect, useState } from 'react'
import { lireEnAttente, surModificationJournal } from '../stockage/journal'

// Nombre d'ajouts et de suppressions pas encore reçus par le serveur
// (visibilité de l'état du système : on sait que rien n'est perdu)
export function useEnAttente() {
  const [nombre, setNombre] = useState(0)

  useEffect(() => {
    const relire = () =>
      lireEnAttente().then(({ creations, suppressions }) => setNombre(creations.length + suppressions.length))
    relire()
    return surModificationJournal(relire)
  }, [])

  return nombre
}
