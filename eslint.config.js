import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'release/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    }
  },
  {
    files: ['vite.config.js', 'electron/**/*.js'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      globals: globals.worker
    }
  }
]
