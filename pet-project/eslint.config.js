import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // catch-блоки без тела — у нас сознательный паттерн (swallow JSON.parse,
      // localStorage в Safari Private, AudioContext, Notification API и т.п.).
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Тесты: any в моках/стабах — нормальная практика, не тянем сюда строгость
    // продакшен-типов. react-refresh-правила к тест-файлам неприменимы.
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
