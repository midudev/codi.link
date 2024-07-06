import * as monaco from 'monaco-editor'
import { $ } from '../../../utils/dom.js'
import { copyToClipboard } from '../../../utils/string'

export const initEditorHotKeys = (editor) => {
  // Shortcut: Open/Close Settings
  editor.addAction({
    id: 'toggle-settings',
    label: 'Toggle Settings',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Comma],
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 1.5,
    // Method that will be executed when the action is triggered.
    // @param editor The editor instance is passed in as a convenience
    run: () => {
      const $settingsButton = $("button[data-action='show-settings-bar']")
      $settingsButton && $settingsButton.click()
    }
  })

  // Shortcut: Copy URL
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC,
    () => {
      const url = new URL(window.location.href)
      const urlToCopy = `https://codi.link${url.pathname}`
      copyToClipboard(urlToCopy)
    }
  )
}
