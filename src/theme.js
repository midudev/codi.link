/**
 * Change the color theme used in the workbench.
 * @param {'vs-dark' | 'vs' | 'hc-black' | 'hc-light'} theme
 */

export const setTheme = theme => {
  document.documentElement.setAttribute('data-theme', theme)
}
