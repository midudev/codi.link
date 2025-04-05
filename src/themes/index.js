import DraculaTheme from './dracula.json'
import GitHubDarkTheme from './github-dark.json'
import OneDarkProTheme from './one-dark-pro.json'
import VsDarkTheme from './vs-dark.json'
import VsLightTheme from './vs-light.json'
import HcBlackTheme from './hc-black.json'
import HcLightTheme from './hc-light.json'

export const FALLBACK_THEME = VsDarkTheme

const Theme = (json, label, translationId) => ({ json, label, translationId })
export const themes = {
  'vs-dark': Theme(VsDarkTheme, 'Dark (default)', 'dark'),
  'vs-light': Theme(VsLightTheme, 'Light', 'light'),
  'hc-black': Theme(HcBlackTheme, 'High Contrast Dark', 'highContrastDark'),
  'hc-light': Theme(HcLightTheme, 'High Contrast Light', 'highContrastLight'),
  'github-dark': Theme(GitHubDarkTheme, 'GitHub Dark'),
  'one-dark-pro': Theme(OneDarkProTheme, 'One Dark Pro'),
  dracula: Theme(DraculaTheme, 'Dracula')
}
