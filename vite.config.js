import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'process.env.BABEL_TYPES_8_BREAKING': false
  }
})
