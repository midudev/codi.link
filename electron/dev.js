import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_NAME = 'codi.link'

const applyMacDevIdentity = (electronBinary) => {
  if (process.platform !== 'darwin') return

  const contents = path.resolve(electronBinary, '..', '..')
  const plist = path.join(contents, 'Info.plist')
  const bundledIcon = path.join(contents, 'Resources', 'electron.icns')
  const appIcon = path.join(__dirname, 'icons', 'icon.icns')

  if (existsSync(plist)) {
    spawnSync('plutil', ['-replace', 'CFBundleDisplayName', '-string', APP_NAME, plist])
    spawnSync('plutil', ['-replace', 'CFBundleName', '-string', APP_NAME, plist])
  }

  if (existsSync(appIcon) && existsSync(bundledIcon)) {
    copyFileSync(appIcon, bundledIcon)
  }
}

const PORT = 5173
const URL = `http://localhost:${PORT}`

const waitForServer = async (url, timeout = 30000) => {
  const started = Date.now()

  while (Date.now() - started < timeout) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(800) })
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 150))
    }
  }

  throw new Error(`Timed out waiting for Vite at ${url}`)
}

const vite = spawn('bun', ['vite', '--port', String(PORT)], {
  stdio: 'inherit',
  env: process.env
})

vite.on('exit', (code) => {
  if (code && code !== 0) process.exit(code)
})

try {
  await waitForServer(URL)
} catch (error) {
  vite.kill()
  console.error(error.message)
  process.exit(1)
}

const { default: electron } = await import('electron')
applyMacDevIdentity(electron)

const app = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_START_URL: URL
  }
})

const shutdown = () => {
  app.kill()
  vite.kill()
}

app.on('exit', (code) => {
  vite.kill()
  process.exit(code ?? 0)
})

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
