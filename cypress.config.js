import { defineConfig } from 'cypress'

export default defineConfig({
  experimentalStudio: true,
  defaultCommandTimeout: 5000,
  video: false,
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:3000'
  }
})
