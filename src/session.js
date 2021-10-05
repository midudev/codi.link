import Peer from 'peerjs'
import { decode } from 'js-base64'
import sillyname from 'https://cdn.skypack.dev/sillyname'
import { EditorContentManager, RemoteSelectionManager, RemoteCursorManager } from '@convergencelabs/monaco-collab-ext'
import { ColorAssigner } from '@convergence/color-assigner'

import { $, $$ } from './utils/dom'
import { getSessionId, removeIdFromUrl } from './utils/url'
import { getState } from './state'

const colorAssigner = new ColorAssigner()
const $liveShareBar = $('#live-share')
const $buttons = $$('button', $liveShareBar)
const $contents = $$('.live-share-content', $liveShareBar)
const $joinForm = $('#join-form')
const $sessionInput = $('input[data-for=join-session]')
const $usernameInput = $('input[data-for=session-user]')
const $sessionId = $('span[data-for=session-id]')
const $participantsList = $('.participants-list')

const contentManagers = {
  html: null,
  css: null,
  js: null
}

const remoteSelectionManagers = {
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

const remoteCursorManagers = {
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

let lastSelection
const initializeContentManager = () => {
  const editors = getEditors()
  for (const key in editors) {
    const editor = editors[key]
    remoteCursorManagers[key].manager = new RemoteCursorManager({
      editor,
      tooltips: true,
      tooltipDuration: 2
    })
    remoteCursorManagers[key].event = editor.onDidChangeCursorPosition(({ position }) => {
      const offset = editor.getModel().getOffsetAt(position)
      session.broadcast({
        type: 'UPDATE_CURSOR',
        editor: key,
        offset,
        peer: session.peer.id
      })
    })
    remoteSelectionManagers[key].manager = new RemoteSelectionManager({ editor })
    remoteSelectionManagers[key].event = editor.onDidChangeCursorSelection(e => {
      const selection = editor.getSelection()
      if (!selection.isEmpty()) {
        const editorModel = editor.getModel()
        const start = editorModel.getOffsetAt(selection.getStartPosition())
        const end = editorModel.getOffsetAt(selection.getEndPosition())
        lastSelection = { start, end }
        session.broadcast({
          type: 'UPDATE_SELECTION',
          editor: key,
          peer: session.peer.id,
          value: lastSelection
        })
      } else if (lastSelection) {
        lastSelection = null
        session.broadcast({
          type: 'UPDATE_SELECTION',
          editor: key,
          peer: session.peer.id,
          value: lastSelection
        })
      }
    })
    contentManagers[key] = new EditorContentManager({
      editor,
      onInsert (index, text) {
        session.broadcast({
          type: 'INSERT_TEXT',
          editor: key,
          index,
          text
        })
      },
      onReplace (index, length, text) {
        session.broadcast([{
          type: 'DELETE_TEXT',
          editor: key,
          index,
          length
        }, {
          type: 'INSERT_TEXT',
          editor: key,
          index,
          text
        }])
      },
      onDelete (index, length) {
        session.broadcast({
          type: 'DELETE_TEXT',
          editor: key,
          index,
          length
        })
      }
    })
  }
}

const removeRemoteCursor = (peer) => {
  for (const editor in remoteCursorManagers) {
    const remoteCursor = remoteCursorManagers[editor].cursors.get(peer)
    if (remoteCursor) {
      remoteCursorManagers[editor].cursors.delete(peer)
      remoteCursor.dispose()
    }
  }
}

const removeRemoteSelection = (peer) => {
  for (const editor in remoteSelectionManagers) {
    const remoteSelection = remoteSelectionManagers[editor].selections.get(peer)
    if (remoteSelection) {
      remoteSelectionManagers[editor].selections.delete(peer)
      remoteSelection.dispose()
    }
  }
}

const getEditors = () => {
  const { html, css, js } = getState().editors
  return { html, css, js }
}

const getData = () => {
  const { pathname } = window.location
  const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')
  return [rawHtml, rawCss, rawJs]
}

const setData = ([rawHtml, rawCss, rawJs]) => {
  const { html: htmlEditor, css: cssEditor, js: jsEditor } = getEditors()
  htmlEditor.setValue(rawHtml ? decode(rawHtml) : '')
  cssEditor.setValue(rawCss ? decode(rawCss) : '')
  jsEditor.setValue(rawJs ? decode(rawJs) : '')
}

const showSessionContent = (status) => {
  $contents.forEach(content => {
    const isSelectedContent = content.getAttribute('data-session') === status
    isSelectedContent ? content.removeAttribute('hidden') : content.setAttribute('hidden', '')
  })
}

const loadSessionId = (id) => {
  $sessionId.innerHTML = id
}

const addParticipant = (name, peer) => {
  const li = document.createElement('li')
  li.innerHTML = name
  li.setAttribute('data-peer', peer)
  li.classList = 'participant'
  $participantsList.append(li)
}

const removeParticipants = () => {
  $participantsList.innerHTML = ''
}

const updateParticipants = () => {
  const $quantity = $('span[data-for=session-participants]')
  $quantity.innerHTML = session.network.length + 1
  removeParticipants()
  addParticipant(`${session.name} (you)`, session.peer.id)
  session.network.forEach(participant => {
    addParticipant(participant.name, participant.conn.peer)
  })
}

const disconnectSession = () => {
  removeIdFromUrl()
  showSessionContent('disconnected')
  removeParticipants()
  loadSessionId('')
  for (const editor of ['html', 'css', 'js']) {
    contentManagers[editor] = null
    remoteSelectionManagers[editor].event.dispose()
    remoteCursorManagers[editor].event.dispose()
    remoteSelectionManagers[editor] = {
      manager: null,
      event: null,
      selections: new Map()
    }
    remoteCursorManagers[editor] = {
      manager: null,
      event: null,
      cursors: new Map()
    }
  }
  session = null
}

const initializeSession = (id) => {
  removeIdFromUrl()
  initializeContentManager()
  loadSessionId(id)
  updateParticipants()
  showSessionContent('connected')
}

const EVENTS = {
  ADD_TO_NETWORK: (conn, data) => {
    const { name, role, peer } = data
    if (peer === session.peer.id || session._existsOnNetwork(peer)) return
    session.connect(peer, name, role)
  },
  SETUP: (conn, data) => {
    setData(data.data)
    const serverConn = session.network.find(p => p.conn.peer === data.server.peer)
    if (serverConn) {
      serverConn.name = data.server.name
      serverConn.role = data.server.role
    }
    initializeSession(data.server.peer)
  },
  INSERT_TEXT: (conn, data) => {
    const { index, text, editor } = data
    contentManagers[editor].insert(index, text)
  },
  DELETE_TEXT: (conn, data) => {
    const { index, length, editor } = data
    contentManagers[editor].delete(index, length)
  },
  UPDATE_CURSOR: (conn, data) => {
    const { peer, offset, editor } = data
    if (session.peer.id === peer) return

    let remoteCursor = remoteCursorManagers[editor].cursors.get(peer)
    if (offset !== null) {
      if (!remoteCursor) {
        const color = colorAssigner.getColorAsHex(peer)
        const participant = session.network.find(p => p.conn.peer === conn.peer)
        remoteCursor = remoteCursorManagers[editor].manager.addCursor(peer, color, participant.name)
        remoteCursorManagers[editor].cursors.set(peer, remoteCursor)
      }
      remoteCursor.setOffset(offset)
    } else if (remoteCursor) {
      remoteCursor.hide()
    }
  },
  UPDATE_SELECTION: (conn, data) => {
    const { peer, value, editor } = data
    if (session.peer.id === peer) return

    let remoteSelection = remoteSelectionManagers[editor].selections.get(peer)
    if (value !== null) {
      if (!remoteSelection) {
        const color = colorAssigner.getColorAsHex(peer)
        remoteSelection = remoteSelectionManagers[editor].manager.addSelection(peer, color)
        remoteSelectionManagers[editor].selections.set(peer, remoteSelection)
      }
      remoteSelection.setOffsets(value.start, value.end)
    } else if (remoteSelection) {
      remoteSelection.hide()
    }
  }
}

class Session {
  constructor (role, name, target) {
    this.role = role
    this.name = name || sillyname()
    this.target = target
    this.peer = new Peer()
    this.network = []
    this._listenToPeer()
  }

  connect (id, name, role) {
    const conn = this.peer.connect(id, { metadata: { name: this.name, role: this.role } })
    conn.on('open', () => {
      this._addToNetwork(conn, false, name, role)
    })
    this._listenToConnection(conn)
  }

  close () {
    this.peer.destroy()
  }

  broadcast (data) {
    this.network.forEach(p => p.conn.send(data))
  }

  _listenToPeer () {
    this._onPeerOpen()
    this._onPeerConnection()
    this._onPeerClose()
    this._onPeerDisconnected()
    this._onPeerError()
  }

  _listenToConnection (conn) {
    this._onConnectionData(conn)
    this._onConnectionClose(conn)
  }

  _onPeerOpen () {
    this.peer.on('open', (id) => {
      if (this.target) return this.connect(this.target)
      initializeSession(id)
    })
  }

  _onPeerConnection () {
    this.peer.on('connection', (conn) => {
      const { metadata } = conn
      this._addToNetwork(conn, this.role === 'owner', metadata.name, metadata.role)
      this._listenToConnection(conn)
      if (this.role === 'owner') {
        conn.on('open', () => {
          conn.send({
            type: 'SETUP',
            server: {
              name: this.name,
              role: this.role,
              peer: this.peer.id
            },
            data: getData()
          })
        })
      }
    })
  }

  _onPeerDisconnected () {
    this.peer.on('disconnected', () => {
      console.log('Peer disconnected')
    })
  }

  _onPeerClose () {
    this.peer.on('close', () => {
      console.log('Peer destroyed')
      disconnectSession()
    })
  }

  _onPeerError () {
    this.peer.on('error', (err) => {
      console.log(err)
      this.peer.destroy()
    })
  }

  _onConnectionData (conn) {
    conn.on('data', (data) => {
      const events = Array.isArray(data) ? data : [data]
      events.forEach(d => {
        EVENTS[d.type](conn, d)
      })
    })
  }

  _onConnectionClose (conn) {
    conn.on('close', () => {
      removeRemoteCursor(conn.peer)
      removeRemoteSelection(conn.peer)
      if (this._isSessionOwner(conn.peer)) return this.close()
      this._removeFromNetwork(conn.peer)
    })
  }

  _isSessionOwner (peer) {
    const participant = this.network.find(p => p.conn.peer === peer)
    return participant ? participant.role === 'owner' : false
  }

  _existsOnNetwork (peer) {
    return this.network.some(p => p.conn.peer === peer)
  }

  _addToNetwork (conn, broadcast = false, name, role) {
    if (this._existsOnNetwork(conn.peer)) return
    this.network.push({
      name,
      role,
      conn
    })
    updateParticipants()
    if (broadcast) {
      this.broadcast({
        type: 'ADD_TO_NETWORK',
        name,
        role,
        peer: conn.peer
      })
    }
  }

  _removeFromNetwork (peer) {
    this.network = this.network.filter(p => p.conn.peer !== peer)
    updateParticipants(peer)
  }
}

let session = null
const target = getSessionId()
if (target) session = new Session('guest', null, target)

const ACTIONS = {
  'generate-name': () => {
    $usernameInput.value = sillyname()
  },
  'share-session': () => {
    session = new Session('owner', $usernameInput.value, null)
  },
  'join-session': () => {},
  'disconnect-session': () => {
    session.close()
  },
  'copy-session-link': () => {
    let sessionId = ''
    if (session.role === 'owner') sessionId = session.peer.id
    if (session.role === 'guest') sessionId = session.network.find(c => c.role === 'owner').conn.peer
    navigator.clipboard.writeText(`${window.location.origin}/?join=${sessionId}`)
  }
}

$joinForm.addEventListener('submit', (e) => {
  e.preventDefault()
  session = new Session('guest', $usernameInput.value, $sessionInput.value)
})

$buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action')
    ACTIONS[action]()
  })
})
