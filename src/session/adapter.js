import { EditorContentManager, RemoteSelectionManager, RemoteCursorManager } from '@convergencelabs/monaco-collab-ext'
import { getState } from '../state'

const getEditors = () => {
  const { html, css, js } = getState().editors
  return { html, css, js }
}

export default class MonacoCollabAdapter {
  constructor (broadcast, peer) {
    this.editors = getEditors()
    this.init(broadcast, peer)
  }

  init (broadcast, peer) {
    this._initCursorManager()
    this._initSelectionManager()
    this._initContentManager()
    for (const editorType in this.editors) {
      const editor = this.editors[editorType]
      this._setCursorManager(editorType, editor, broadcast, peer)
      this._setSelectionManager(editorType, editor, broadcast, peer)
      this._setContentManager(editorType, editor, broadcast)
    }
  }

  _initCursorManager () {
    this._cursorManager = {
      html: {
        manager: null,
        event: null,
        cursors: new Map()
      },
      css: {
        manager: null,
        event: null,
        cursors: new Map()
      },
      js: {
        manager: null,
        event: null,
        cursors: new Map()
      }
    }
  }

  _initSelectionManager () {
    this._selectionManager = {
      html: {
        manager: null,
        event: null,
        selections: new Map()
      },
      css: {
        manager: null,
        event: null,
        selections: new Map()
      },
      js: {
        manager: null,
        event: null,
        selections: new Map()
      }
    }
  }

  _initContentManager () {
    this._contentManager = {
      html: null,
      css: null,
      js: null
    }
  }

  _setCursorManager (editorType, editor, broadcast, peer) {
    this._cursorManager[editorType].manager = new RemoteCursorManager({
      editor,
      tooltips: false, // Disabled due to styles bug
      tooltipDuration: 2
    })
    this._cursorManager[editorType].event = editor.onDidChangeCursorPosition(({ position }) => {
      const offset = editor.getModel().getOffsetAt(position)
      broadcast({
        type: 'UPDATE_CURSOR',
        editor: editorType,
        offset,
        peer
      })
    })
  }

  _setSelectionManager (editorType, editor, broadcast, peer) {
    this._selectionManager[editorType].manager = new RemoteSelectionManager({ editor })
    this._selectionManager[editorType].event = editor.onDidChangeCursorSelection(e => {
      const selection = editor.getSelection()
      if (!selection.isEmpty()) {
        const editorModel = editor.getModel()
        const start = editorModel.getOffsetAt(selection.getStartPosition())
        const end = editorModel.getOffsetAt(selection.getEndPosition())
        this.lastSelection = { start, end }
        broadcast({
          type: 'UPDATE_SELECTION',
          editor: editorType,
          peer,
          value: this.lastSelection
        })
        return
      }
      if (this.lastSelection) {
        this.lastSelection = null
        broadcast({
          type: 'UPDATE_SELECTION',
          editor: editorType,
          peer,
          value: this.lastSelection
        })
      }
    })
  }

  _setContentManager (editorType, editor, broadcast) {
    this._contentManager[editorType] = new EditorContentManager({
      editor,
      onInsert (index, text) {
        broadcast({
          type: 'INSERT_TEXT',
          editor: editorType,
          index,
          text
        })
      },
      onReplace (index, length, text) {
        broadcast([{
          type: 'DELETE_TEXT',
          editor: editorType,
          index,
          length
        }, {
          type: 'INSERT_TEXT',
          editor: editorType,
          index,
          text
        }])
      },
      onDelete (index, length) {
        broadcast({
          type: 'DELETE_TEXT',
          editor: editorType,
          index,
          length
        })
      }
    })
  }

  removeRemoteCursor (peer) {
    for (const editor in this._cursorManager) {
      const remoteCursor = this._cursorManager[editor].cursors.get(peer)
      if (remoteCursor) {
        this._cursorManager[editor].cursors.delete(peer)
        remoteCursor.dispose()
      }
    }
  }

  removeRemoteSelection (peer) {
    for (const editor in this._selectionManager) {
      const remoteSelection = this._selectionManager[editor].selections.get(peer)
      if (remoteSelection) {
        this._selectionManager[editor].selections.delete(peer)
        remoteSelection.dispose()
      }
    }
  }

  reset () {
    for (const editor in this.editors) {
      this._selectionManager[editor].event.dispose()
      this._cursorManager[editor].event.dispose()
    }
    this._initContentManager()
    this._initSelectionManager()
    this._initCursorManager()
  }
}
