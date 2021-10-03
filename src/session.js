import Peer from 'peerjs'
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
const $participantsNumber = $('span[data-for=session-participants]')

const showSessionContent = (status) => {
  $contents.forEach(content => {
    const isSelectedContent = content.getAttribute('data-session') === status
    isSelectedContent ? content.removeAttribute('hidden') : content.setAttribute('hidden', '')
  })
}

const loadSessionId = (id) => {
  $sessionId.innerHTML = id
}

const loadSessionParticipants = () => {
  const participantsNumber = session.network.length
  $participantsNumber.innerHTML = participantsNumber
}

const EVENTS = {
  ADD_TO_NETWORK: (data) => {
    const { name, role, peer } = data
    if (peer === session.peer.id || session.network.some(p => p.conn.peer === peer)) return
    session.connect(peer, name, role)
  },
  DATA: () => {},
  INIT: () => {}
}

class Session {
  constructor (role, targetId, name) {
    this.role = role
    this.targetId = targetId
    this.name = name || sillyname()
    this.peer = new Peer()
    this.network = []
    this._listen()
  }

  connect (id, name, role) {
    const conn = this.peer.connect(id, { metadata: { name: this.name, role: this.role } })
    this._onData(conn)
    conn.on('open', () => {
      console.log(`Connected to ${id}`)
      removeIdFromUrl()
      this._addToNetwork(conn, false, name, role)
      showSessionContent('connected')
      if (!role) loadSessionId(id)
      loadSessionParticipants()
    })
    conn.on('close', () => {
      console.log('Server disconnected')
      showSessionContent('disconnected')
    })
  }

  close () {
    this.peer.destroy()
  }

  broadcast (data) {
    this.network.forEach(p => p.conn.send(data))
  }

  _listen () {
    this._onPeerOpen()
    this._onPeerConnection()
    this._onPeerClose()
    this._onPeerDisconnected()
    this._onPeerError()
  }

  _onPeerOpen () {
    this.peer.on('open', (id) => {
      console.info('Peer ID: ' + id)
      if (this.targetId) return this.connect(this.targetId)
      showSessionContent('connected')
      loadSessionId(id)
    })
  }

  _onPeerConnection () {
    this.peer.on('connection', (conn) => {
      console.log('Receiving connection')
      const { metadata } = conn
      this._addToNetwork(conn, this.role === 'owner', metadata.name, metadata.role)
      this._onData(conn)
      loadSessionParticipants()
      conn.on('close', () => {
        console.log('Client disconnected')
      })
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

  _onData (conn) {
    conn.on('data', (data) => {
      EVENTS[data.type](data)
    })
  }

  _addToNetwork (conn, broadcast = false, name, role) {
    const connectionExists = this.network.some(p => p.conn.peer === conn.peer)
    if (connectionExists) return
    this.network.push({
      name,
      role,
      conn
    })
    if (broadcast) {
      this.broadcast({
        type: 'ADD_TO_NETWORK',
        name,
        role,
        peer: conn.peer
      })
    }
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
  'join-session': () => {
    const sessionId = $sessionInput.value
    if (sessionId) session = new Session('guest', sessionId, $usernameInput.value)
  },
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
  session = new Session($sessionInput.value)
})

$buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action')
    ACTIONS[action]()
  })
})
