import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['src-tauri/target/**', 'dist/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    }
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: globals.node
    }
  }
]
