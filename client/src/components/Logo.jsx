// Logo de Tantsaha Connect : deux terrasses de rizière, d'où sort une jeune pousse.
// Dessiné pour l'application (même tracé que public/favicon.svg et les icônes d'installation).
export default function Logo({ taille = 40, className }) {
  return (
    <svg className={className} width={taille} height={taille} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="var(--marque, #1d4a33)" />
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M6.5 24.5c3.2-2.1 15.8-2.1 19 0" strokeWidth="2.2" />
        <path d="M9 20c2.6-1.6 11.4-1.6 14 0" strokeWidth="2" opacity="0.75" />
        <path d="M16 18.6v-7.4" strokeWidth="2" />
      </g>
      <g fill="#fff">
        <path d="M16 13.4c-3.1 0-5.2-1.9-5.3-4.9 3 0 5.2 1.8 5.3 4.9Z" />
        <path d="M16 11.6c.1-3 2.3-4.9 5.4-4.9-.1 3-2.3 4.9-5.4 4.9Z" />
      </g>
    </svg>
  )
}
