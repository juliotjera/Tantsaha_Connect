import { useEffect, useMemo, useState } from 'react'
import { calculerAlertes } from '../logique/alertes'
import { listerObservations, surModificationJournal } from '../stockage/journal'
import { useMeteo } from '../stockage/meteo'
import { usePreferences } from '../stockage/preferences'
import { aujourdhui } from '../utils/dates'

// Alertes en cours, recalculées quand la météo, le journal ou la langue changent
export function useAlertes() {
  const meteo = useMeteo()
  const { langue } = usePreferences()
  const [observations, setObservations] = useState([])

  useEffect(() => {
    const relire = () => listerObservations().then(setObservations)
    relire()
    return surModificationJournal(relire)
  }, [])

  const alertes = useMemo(
    () => calculerAlertes({ previsions: meteo.previsions, observations, aujourdhui: aujourdhui(), langue }),
    [meteo.previsions, observations, langue],
  )
  return { alertes, meteo, observations }
}
