import { DEFAULT_GRID_TEMPLATE } from './editor-grid-template'
import { DEFAULT_LAYOUT } from './grid-templates'

export const DEFAULT_INITIAL_SETTINGS = {
  fontSize: 18,
  lineNumbers: 'off',
  minimap: false,
  theme: 'vs-dark',
  wordWrap: 'on',
  fontLigatures: 'on',
  fontFamily: "'Cascadia Code PL', 'Menlo', 'Monaco', 'Courier New', 'monospace'",
  preserveGrid: true,
  layout: {
    gutters: DEFAULT_LAYOUT,
    style: DEFAULT_GRID_TEMPLATE,
    type: 'default'
  }
}
