import { defineConfig } from 'vite'

export default defineConfig({
  worker: {
    format: 'es'
  },
  build: {
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter(dep => !dep.includes('monaco-'))
    },
    rollupOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'monaco', test: /[\\/]monaco-editor[\\/]/ },
            { name: 'vendor', test: /[\\/]node_modules[\\/]/ }
          ]
        }
      }
    }
  }
})
