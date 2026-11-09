import { useT } from '../i18n'

// Politique de confidentialité (exigée par les boutiques d'applications) :
// ce que l'application garde, ce qu'elle envoie, à qui, et comment tout effacer.
// Elle décrit le fonctionnement réel du code (voir src/stockage et server/src).
const TEXTES = {
  mg: {
    intro: "Tantsaha Connect dia tsy mangataka kaonty, anarana na laharana finday. Ireto ny angona ampiasainy :",
    sections: [
      ['Rakitsoratra', "Ny zavatra soratanao (karazany, voly, daty, fanamarihana) dia tehirizina ao amin'ny finday, ary alefa any amin'ny mpizara ny fampiharana (Render, any Eoropa) miaraka amina laharana kisendrasendra, tsy mifandray amin'ny maha-ianao anao. Ampiasaina hitehirizana dika mitovy fotsiny izy ireo."],
      ['Toerana', "Ny toerana fidinao (amin'ny lisitra na GPS) dia boribory ho eo amin'ny 1 km eo ho eo, tehirizina ao amin'ny finday, ary alefa any amin'i Open-Meteo fotsiny mba hahazoana ny toetrandro."],
      ['Sary', "Mijanona ao amin'ny finday ny sary : tsy alefa mihitsy, raha tsy ianao no mizara azy."],
      ['Tsy misy', 'Tsy misy dokam-barotra, tsy misy fanaraha-maso, tsy misy fandrefesana ny mpampiasa.'],
      ['Fampandrenesana', "Ny finday mihitsy no mamoaka ny fampandrenesana loza : tsy misy mpizara mandefa azy."],
      ['Famafana', "Ny famafana zavatra iray ao amin'ny rakitsoratra dia mamafa azy koa any amin'ny mpizara. Ny fanesorana ny fampiharana dia mamafa ny zavatra rehetra ao amin'ny finday."],
      ['Mpampiantrano', "Mety hitahiry vanim-potoana fohy ny adiresy IP ny mpampiantrano (Render), toy ny tranonkala rehetra."],
    ],
    contact: 'Fanontaniana : ',
    maj: 'Nohavaozina ny 9 Novambra 2026.',
  },
  fr: {
    intro: "Tantsaha Connect ne demande ni compte, ni nom, ni numéro de téléphone. Voici les seules données qu'elle utilise :",
    sections: [
      ['Journal', "Ce que vous notez (type, culture, date, note) est gardé sur le téléphone et envoyé au serveur de l'application (Render, en Europe) avec un identifiant aléatoire, sans lien avec votre identité. Il sert uniquement à garder une copie."],
      ['Lieu', 'Le lieu choisi (dans la liste ou par GPS) est arrondi à environ 1 km, gardé sur le téléphone, et envoyé seulement à Open-Meteo pour obtenir la météo.'],
      ['Photos', 'Les photos restent sur le téléphone : elles ne sont jamais envoyées, sauf si vous les partagez vous-même.'],
      ['Aucun suivi', 'Pas de publicité, pas de traceur, pas de mesure d’audience.'],
      ['Notifications', 'Les notifications de danger sont produites par le téléphone lui-même : aucun serveur ne les envoie.'],
      ['Effacer', "Supprimer une observation du journal l'efface aussi du serveur. Désinstaller l'application efface tout le reste du téléphone."],
      ['Hébergeur', 'Comme pour tout site, l’hébergeur (Render) peut garder brièvement des journaux techniques (adresse IP).'],
    ],
    contact: 'Questions : ',
    maj: 'Mise à jour le 9 novembre 2026.',
  },
}

export default function Confidentialite() {
  const { langue } = useT()
  const T = TEXTES[langue]
  return (
    <section className="apropos">
      <p>{T.intro}</p>
      {T.sections.map(([titre, texte]) => (
        <div key={titre}>
          <h2>{titre}</h2>
          <p>{texte}</p>
        </div>
      ))}
      <p>
        {T.contact}
        <a href="https://github.com/juliotjera/Tantsaha_Connect/issues" target="_blank" rel="noreferrer">
          github.com/juliotjera/Tantsaha_Connect/issues
        </a>
      </p>
      <p className="apropos-maj">{T.maj}</p>
    </section>
  )
}
