import { langueActuelle, sonActif } from './preferences'

// Retour sonore après une action (enregistrer, supprimer) : un petit carillon,
// puis le mot dit à voix haute (« Voatahiry », « Voafafa »). Pour ceux qui ne
// lisent pas le message affiché, c'est la confirmation que l'action a réussi.
// Désactivable dans « Fikirana » (option « Feo »).
const MOTS = {
  enregistre: { fichier: 'retour-voatahiry', fr: 'Enregistré' },
  supprime: { fichier: 'retour-voafafa', fr: 'Supprimé' },
}

let contexte = null

// deux notes montantes (enregistré) ou descendantes (supprimé), très courtes
function carillon(montant) {
  const Contexte = window.AudioContext ?? window.webkitAudioContext
  if (!Contexte) return
  contexte ??= new Contexte()
  const notes = montant ? [660, 880] : [660, 494]
  notes.forEach((frequence, i) => {
    const debut = contexte.currentTime + i * 0.11
    const oscillateur = contexte.createOscillator()
    const volume = contexte.createGain()
    oscillateur.type = 'sine'
    oscillateur.frequency.value = frequence
    volume.gain.setValueAtTime(0.0001, debut)
    volume.gain.exponentialRampToValueAtTime(0.18, debut + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, debut + 0.22)
    oscillateur.connect(volume).connect(contexte.destination)
    oscillateur.start(debut)
    oscillateur.stop(debut + 0.24)
  })
}

export function confirmer(action) {
  if (!sonActif()) return
  const mot = MOTS[action]
  try {
    carillon(action === 'enregistre')
  } catch {
    // son indisponible : la confirmation visuelle et la vibration suffisent
  }
  setTimeout(() => {
    if (langueActuelle() === 'mg') {
      new Audio(`/audio/${mot.fichier}.mp3`).play().catch(() => {})
    } else if ('speechSynthesis' in window) {
      const phrase = new SpeechSynthesisUtterance(mot.fr)
      phrase.lang = 'fr-FR'
      window.speechSynthesis.speak(phrase)
    }
  }, 260)
}
