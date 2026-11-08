import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// police Atkinson Hyperlegible Next (Braille Institute), en graisses variables : conçue pour être lue facilement,
// même par ceux qui lisent peu ou voient mal ; intégrée à l'application (hors ligne)
import '@fontsource-variable/atkinson-hyperlegible-next/index.css'
import '@fontsource-variable/bricolage-grotesque/index.css'
import './index.css'
import './rubriques.css'
import App from './App.jsx'
// écoute dès le démarrage l'annonce « application installable » du navigateur
import './stockage/installation'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter : permet de changer d'écran (/meteo, /journal…) sans recharger la page */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
