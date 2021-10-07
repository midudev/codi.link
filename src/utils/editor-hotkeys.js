import * as monaco from 'monaco-editor'
import { $ } from './dom.js'
import { copyToClipboard } from './string'

export const initEditorHotKeys = ({ htmlEditor, jsEditor, cssEditor }) => {
  const editors = [htmlEditor, jsEditor, cssEditor]

  editors.forEach((editor) => {
    editor.addAction({
      id: 'toggle-settings',
      label: 'Toggle Settings',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_COMMA],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: function (editor) {
        const $settingsButton = $("button[data-action='show-settings-bar']")
        $settingsButton && $settingsButton.click()
      }
    })
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_C,
      function () {
        copyToClipboard(window.location.href)
      }
    )
  })
}
