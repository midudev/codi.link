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

const showSessionContent = (status) => {
  $contents.forEach(content => {
    const isSelectedContent = content.getAttribute('data-session') === status
    isSelectedContent ? content.removeAttribute('hidden') : content.setAttribute('hidden', '')
  })
}

const loadSessionId = (id) => {
  $sessionId.innerHTML = id
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

  connect (id) {
    const conn = this.peer.connect(id, { metadata: { name: this.name } })
    conn.on('open', () => {
      console.log(`Connected to ${id}`)
      removeIdFromUrl()
      this._addToNetwork(conn)
      this._onData(conn)
      showSessionContent('connected')
      loadSessionId(id)
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
    this.network.forEach(c => c.send(data))
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
      this._addToNetwork(conn)
      this._onData(conn)
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
    conn.on('data', function (data) {
      console.log(data)
    })
  }

  _addToNetwork (conn) {
    const connectionExists = this.network.some(c => c.peer === conn.peer)
    if (connectionExists) return
    this.network.push(conn)
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
