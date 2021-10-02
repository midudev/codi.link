import Peer from 'peerjs'
import { $, $$ } from './utils/dom'
import { getSessionId, removeIdFromUrl } from './utils/url'

const $liveShareBar = $('#live-share')
const $buttons = $$('button', $liveShareBar)
const $contents = $$('.live-share-content', $liveShareBar)

const toggleContents = () => {
  $contents.forEach(content => {
    const isHidden = content.hasAttribute('hidden')
    isHidden ? content.removeAttribute('hidden') : content.setAttribute('hidden', '')
  })
}

class Session {
  constructor (targetId) {
    this.targetId = targetId
    this.peer = new Peer()
    this.network = []
    this._listen()
  }

  connect (id) {
    const conn = this.peer.connect(id)
    conn.on('open', () => {
      console.log(`Connected to ${id}`)
      removeIdFromUrl()
      this._addToNetwork(conn)
      this._onData(conn)
    })
    conn.on('close', () => {
      console.log('Server disconnected')
      toggleContents()
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
      if (this.targetId) this.connect(this.targetId)
      toggleContents()
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
      toggleContents()
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
if (targetId) session = new Session(targetId)

const ACTIONS = {
  'share-session': () => {
    session = new Session()
  },
  'join-session': () => {
    toggleContents()
  },
  'disconnect-session': () => {
    session.close()
  }
}

$buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action')
    ACTIONS[action]()
  })
})
