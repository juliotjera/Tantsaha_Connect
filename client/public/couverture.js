// Coquille de index.html : choisit la photo de la saison avant le démarrage de React
// (même correspondance que couvertureDuMois dans src/donnees/photos.js).
;(() => {
  const mois = new Date().getMonth() + 1
  const nom = mois >= 3 && mois <= 6 ? 'recolte' : mois >= 7 && mois <= 10 ? 'ririnina' : 'repiquage'
  const image = document.querySelector('.coquille-photo')
  if (!image) return
  image.srcset = `/photos/couverture-${nom}-640.webp 640w, /photos/couverture-${nom}.webp 1024w`
  image.src = `/photos/couverture-${nom}.webp`
})()
