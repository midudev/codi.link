import { app, BrowserWindow, nativeImage, protocol, net, screen } from 'electron'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_NAME = 'codi.link'
const SCHEME = 'codi'
const DEV_URL = process.env.ELECTRON_START_URL
const ICON_PNG = path.join(__dirname, 'icons/icon.png')

app.setName(APP_NAME)
process.title = APP_NAME

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

const defaultWindowSize = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  return {
    width: Math.round(Math.min(1440, width * 0.84)),
    height: Math.round(Math.min(900, height * 0.84))
  }
}

const createWindow = () => {
  const { width, height } = defaultWindowSize()
  const window = new BrowserWindow({
    title: APP_NAME,
    width,
    height,
    minWidth: 800,
    minHeight: 560,
    show: false,
    autoHideMenuBar: true,
    icon: ICON_PNG,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  window.on('page-title-updated', (event) => event.preventDefault())
  window.once('ready-to-show', () => window.show())

  if (DEV_URL) {
    window.loadURL(DEV_URL)
    return
  }

  window.loadURL(`${SCHEME}://app/`)
}

app.whenReady().then(() => {
  // BrowserWindow.icon does not change the macOS dock. NativeImage also
  // rejects .icns at runtime — use the PNG; .icns is only for packaged builds.
  if (process.platform === 'darwin' && app.dock && existsSync(ICON_PNG)) {
    const image = nativeImage.createFromPath(ICON_PNG)
    if (!image.isEmpty()) app.dock.setIcon(image)
  }

  if (!DEV_URL) {
    const dist = path.resolve(__dirname, '..', 'dist')

    protocol.handle(SCHEME, (request) => {
      const url = new URL(request.url)
      let pathname = decodeURIComponent(url.pathname)
      if (pathname === '/' || pathname === '') pathname = '/index.html'

      let filePath = path.resolve(dist, pathname.replace(/^[/\\]+/, ''))
      const relative = path.relative(dist, filePath)
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return new Response('Forbidden', { status: 403 })
      }

      if (!existsSync(filePath)) {
        filePath = path.join(dist, 'index.html')
      }

      return net.fetch(pathToFileURL(filePath).href)
    })
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
