import * as monaco from 'monaco-editor'
import { $, setFormControlValue } from '../../../utils/dom'
import { themes } from '../../../themes'
import { getState } from '../../../state'

const { theme } = getState()

export const loadThemes = () => {
  const $themeSelect = $('select#select-theme')

  for (const themeId of Object.keys(themes)) {
    // Define theme in Monaco
    monaco.editor.defineTheme(themeId, themes[themeId].json)
    // Add themes options to select
    if ($themeSelect) {
      const option = document.createElement('option')
      option.value = themeId
      option.textContent = themes[themeId].label
      if (themes[themeId]?.translationId) {
        option.setAttribute('data-translate', themes[themeId].translationId)
      }
      $themeSelect.appendChild(option)
    }
  }

  /**
   * After dynamically populating the theme options in the select element,
   * set the currently selected theme based on saved settings
   */
  if ($themeSelect) setFormControlValue($themeSelect, theme)
}
