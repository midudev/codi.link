import Peer from 'peerjs'
import * as monaco from 'monaco-editor'
import { decode } from 'js-base64'
import sillyname from 'https://cdn.skypack.dev/sillyname'
import { $, $$ } from './utils/dom'
import { getSessionId, removeIdFromUrl } from './utils/url'

const $liveShareBar = $('#live-share')
const $buttons = $$('button', $liveShareBar)
const $contents = $$('.live-share-content', $liveShareBar)
const $joinForm = $('#join-form')
const $sessionInput = $('input[data-for=join-session]')
const $usernameInput = $('input[data-for=session-user]')
const $sessionId = $('span[data-for=session-id]')
const $participantsList = $('.participants-list')

const getData = () => {
  const { pathname } = window.location
  const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')
  return [rawHtml, rawCss, rawJs]
}

const setData = ([rawHtml, rawCss, rawJs]) => {
  const decodedData = [rawHtml ? decode(rawHtml) : '', rawCss ? decode(rawCss) : '', rawJs ? decode(rawJs) : '']
  monaco.editor.getModels().forEach((e, i) => e.setValue(decodedData[i]))
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

const removeParticipant = (peer) => {
  for (const participant of $participantsList.children) {
    if (participant.getAttribute('data-peer') === peer) return participant.remove()
  }
}

const updateParticipants = () => {
  const $quantity = $('span[data-for=session-participants]')
  $quantity.innerHTML = session.network.length + 1
  removeParticipants()
  addParticipant(session.name, session.peer.id)
  session.network.forEach(participant => {
    addParticipant(participant.name, participant.conn.id)
  })
}

const EVENTS = {
  ADD_TO_NETWORK: (conn, data) => {
    const { name, role, peer } = data
    if (peer === session.peer.id || session._existsOnNetwork(peer)) return
    session.connect(peer, name, role)
  },
  SETUP: (conn, data) => {
    showSessionContent('connected')
    loadSessionId(data.server.peer)
    removeIdFromUrl()
    setData(data.data)
    const serverConn = session.network.find(p => p.conn.peer === data.server.peer)
    if (serverConn) {
      serverConn.name = data.server.name
      serverConn.role = data.server.role
    }
    updateParticipants()
  }
}

class Session {
  constructor (role, targetId, name) {
    this.role = role
    this.targetId = targetId
    this.name = name || sillyname()
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
      if (this.targetId) return this.connect(this.targetId)
      showSessionContent('connected')
      loadSessionId(id)
      updateParticipants()
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
      removeIdFromUrl()
      showSessionContent('disconnected')
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
      EVENTS[data.type](conn, data)
    })
  }

  _onConnectionClose (conn) {
    conn.on('close', () => {
      this._removeFromNetwork(conn.peer)
    })
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
    this.network = this.network.filter(p => p.conn !== peer)
    removeParticipant(peer)
  }
}

let session = null
const targetId = getSessionId()
if (targetId) session = new Session('guest', targetId)

const ACTIONS = {
  'generate-name': () => {
    $usernameInput.value = sillyname()
  },
  'share-session': () => {
    session = new Session('owner', null, $usernameInput.value)
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
  session = new Session('guest', $sessionInput.value, $usernameInput.value)
})

$buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action')
    ACTIONS[action]()
  })
})
