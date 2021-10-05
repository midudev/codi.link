import { ColorAssigner } from '@convergence/color-assigner'

const colorAssigner = new ColorAssigner()

export const EVENTS = {
  ADD_TO_NETWORK: function (conn, data) {
    const { name, role, peer } = data
    if (peer === this.peer.id || this._existsOnNetwork(peer)) return
    this.connect(peer, name, role)
  },
  SETUP: function (conn, data) {
    this._setData(data.data)
    const serverConn = this.network.find(p => p.conn.peer === data.server.peer)
    if (serverConn) {
      serverConn.name = data.server.name
      serverConn.role = data.server.role
    }
    this._initSession(data.server.peer)
  },
  INSERT_TEXT: function (conn, data) {
    const { index, text, editor } = data
    this.monacoCollabAdapter._contentManager[editor].insert(index, text)
  },
  DELETE_TEXT: function (conn, data) {
    const { index, length, editor } = data
    this.monacoCollabAdapter._contentManager[editor].delete(index, length)
  },
  UPDATE_CURSOR: function (conn, data) {
    const { peer, offset, editor } = data
    if (this.peer.id === peer) return

    let remoteCursor = this.monacoCollabAdapter._cursorManager[editor].cursors.get(peer)
    if (offset !== null) {
      if (!remoteCursor) {
        const color = colorAssigner.getColorAsHex(peer)
        const participant = this.network.find(p => p.conn.peer === conn.peer)
        remoteCursor = this.monacoCollabAdapter._cursorManager[editor].manager.addCursor(peer, color, participant.name)
        this.monacoCollabAdapter._cursorManager[editor].cursors.set(peer, remoteCursor)
      }
      remoteCursor.setOffset(offset)
    } else if (remoteCursor) {
      remoteCursor.hide()
    }
  },
  UPDATE_SELECTION: function (conn, data) {
    const { peer, value, editor } = data
    if (this.peer.id === peer) return

    let remoteSelection = this.monacoCollabAdapter._selectionManager[editor].selections.get(peer)
    if (value !== null) {
      if (!remoteSelection) {
        const color = colorAssigner.getColorAsHex(peer)
        remoteSelection = this.monacoCollabAdapter._selectionManager[editor].manager.addSelection(peer, color)
        this.monacoCollabAdapter._selectionManager[editor].selections.set(peer, remoteSelection)
      }
      remoteSelection.setOffsets(value.start, value.end)
    } else if (remoteSelection) {
      remoteSelection.hide()
    }
  }
}
