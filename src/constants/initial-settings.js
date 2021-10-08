import { DEFAULT_GRID_TEMPLATE } from './editor-grid-template'
import { DEFAULT_LAYOUT } from './grid-templates'

export const DEFAULT_APP_SETTINGS = {
  preserveGrid: true,
  zipFileName: 'codi.link',
  zipInSingleFile: false,
  layout: {
    gutters: DEFAULT_LAYOUT,
    style: DEFAULT_GRID_TEMPLATE,
    type: 'default'
  }
}

export const DEFAULT_EDITOR_SETTINGS = {
  fontFamily: "'Cascadia Code PL', 'Menlo', 'Monaco', 'Courier New', 'monospace'",
  fontLigatures: 'on',
  fontSize: 18,
  lineNumbers: 'off',
  minimap: false,
  theme: 'vs-dark',
  wordWrap: 'on'
}
