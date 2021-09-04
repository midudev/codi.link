import * as monaco from 'monaco-editor'
import { $ } from './dom.js'

export const initEditorHotKeys = ({ htmlEditor, jsEditor, cssEditor }) => {
  const editors = [htmlEditor, jsEditor, cssEditor]

  editors.forEach(editor => {
    editor.addAction({
      id: 'open-settings',
      label: 'Open Settings',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_COMMA
      ],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convinience
      run: function (editor) {
        $('#settings').removeAttribute('hidden')
        $('#editor').setAttribute('hidden', '')
      }
    })
  })
}
