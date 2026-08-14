import * as monaco from 'monaco-editor'
import { $ } from '../../../utils/dom.js'
import { eventBus, EVENTS } from '../../../events-controller.js'

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
      eventBus.emit(EVENTS.COPY_CURRENT_CODE_URL)
    }
  )
}
