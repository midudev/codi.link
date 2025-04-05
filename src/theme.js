import { themes, FALLBACK_THEME } from './themes'

/**
 * Change the color theme used in the workbench.
 * @param {'vs-dark' | 'vs' | 'hc-black' | 'hc-light'} theme
 */

const setTheme = theme => {
  document.documentElement.setAttribute('data-theme', theme)
  applyThemeToCssVariables(theme)
}

/**
 * Convert from JSON Monaco theme to CSS variables.
 */
function applyThemeToCssVariables (themeId) {
  // Fallback to default vs-dark theme
  const theme = themes[themeId]?.json ?? FALLBACK_THEME
  const colors = theme?.colors ?? FALLBACK_THEME.colors

  // Remove existing theme style element if it exists
  const oldStyle = document.getElementById('theme-styles')
  if (oldStyle) {
    oldStyle.remove()
  }

  // Create new style element
  const styleElement = document.createElement('style')
  styleElement.id = 'theme-styles'

  const styles = {
    'app-background': colors['editor.background'],
    'app-foreground': colors['editor.foreground'],

    'aside-sections-background': colors['activityBar.background'],
    'aside-sections-border': colors['activityBar.border'] ?? 'transparent',

    'aside-bar-background': colors['sideBar.background'],
    'aside-bar-foreground': colors['sideBarTitle.foreground'],
    'aside-bar-border': colors['sideBarActivityBarTop.border'] ?? 'transparent',

    // It sets the color of the resize handles
    'grid-background': colors['sideBar.background'],

    // Activity bar buttons styles
    'button-foreground': colors['activityBar.inactiveForeground'],
    'button-foreground-active': colors['activityBar.foreground'],

    // Tooltip styles
    'button-title-background': colors['checkbox.background'] ??
    colors['settings.checkboxBackground'],
    'button-title-foreground': colors['checkbox.foreground'] ??
    colors['settings.checkboxForeground'],
    'button-title-border': colors['checkbox.border'] ??
    colors['settings.checkboxBorder'] ?? 'transparent',

    // Input styles
    'input-background': colors['input.background'],
    'input-foreground': colors['input.foreground'],
    'input-border': colors['input.border'] ?? 'transparent',

    // Log styles
    'log-log': colors['terminal.ansiGreen'],
    'log-info': colors['terminal.ansiBlue'],
    'log-error': colors['terminal.ansiRed'],
    'log-warn': colors['terminal.ansiYellow']
  }

  let cssText = `[data-theme="${themeId}"] {`
  for (const [cssVar, value] of Object.entries(styles)) {
    if (value) {
      cssText += `--${cssVar}: ${value};`
    }
  }
  cssText += '}'
  styleElement.textContent = cssText
  document.head.appendChild(styleElement)
}

export default setTheme
