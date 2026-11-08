import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Vérification automatique du code (npm run lint)
export default defineConfig([
  globalIgnores(['dist', 'android']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // service worker : autre environnement (self, caches, clients…) ; __FICHIERS__ est remplacé à la compilation
  {
    files: ['service-worker.js'],
    languageOptions: { globals: { ...globals.serviceworker, __FICHIERS__: 'readonly' } },
  },
  // fichiers de configuration et tests exécutés par Node.js
  {
    files: ['vite.config.js', 'src/**/*.test.js', 'src/test/**', 'e2e/**'],
    languageOptions: { globals: { ...globals.node } },
  },
])
