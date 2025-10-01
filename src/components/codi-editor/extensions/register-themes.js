import themesJson from '../themes.json'

export function registerThemes (monaco) {
  Object.entries(themesJson).forEach(([themeName, themeDef]) => {
    monaco.editor.defineTheme(themeName, themeDef)
  })
}
