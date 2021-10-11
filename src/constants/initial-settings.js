import { DEFAULT_GRID_TEMPLATE } from './editor-grid-template'
import { DEFAULT_LAYOUT } from './grid-templates'

export const DEFAULT_INITIAL_SETTINGS = {
  fontFamily: "'Cascadia Code PL', 'Menlo', 'Monaco', 'Courier New', 'monospace'",
  fontLigatures: 'on',
  fontSize: 18,
  lineNumbers: 'off',
  minimap: false,
  preserveGrid: true,
  theme: 'vs-dark',
  wordWrap: 'on',
  zipFileName: 'codi.link',
  zipInSingleFile: false,
  layout: {
    gutters: DEFAULT_LAYOUT,
    style: DEFAULT_GRID_TEMPLATE,
    type: 'default'
  }
}
