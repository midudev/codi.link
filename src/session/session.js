import Peer from 'peerjs'
import sillyname from 'https://cdn.skypack.dev/sillyname'
import { decode } from 'js-base64'
import { SESSION_EVENTS } from './events'
import { eventBus, EVENTS } from '../events-controller.js'
import { getState } from '../state'
import { removeIdFromUrl } from '../utils/url'
import * as SessionDOM from './dom'
import MonacoCollabAdapter from './adapter'

function showSessionContent (status) {
  SessionDOM.contents.forEach(content => {
    const isSelectedContent = content.getAttribute('data-session') === status
    isSelectedContent ? content.removeAttribute('hidden') : content.setAttribute('hidden', '')
  })
}

function loadSessionId (id) {
  SessionDOM.sessionId.innerHTML = id
}

function addParticipant (name, peer) {
  const li = document.createElement('li')
  li.innerHTML = name
  li.setAttribute('data-peer', peer)
  li.classList = 'participant'
  SessionDOM.participantsList.append(li)
}

function removeParticipants () {
  SessionDOM.participantsList.innerHTML = ''
  SessionDOM.participantsQuantity.innerHTML = 0
}

function updateParticipants () {
  removeParticipants()
  addParticipant(`${this.name} (you)`, this.peer.id)
  this.network.forEach(participant => {
    addParticipant(participant.name, participant.conn.peer)
  })
  SessionDOM.participantsQuantity.innerHTML = this.network.length + 1
}

function getEditors () {
  const { html, css, js } = getState().editors
  return { html, css, js }
}

function getData () {
  const { pathname } = window.location
  const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')
  return [rawHtml, rawCss, rawJs]
}

export default class Session {
  constructor (role, name, target) {
    this.role = role
    this.name = name || this._setDefaultName()
    this.target = target
    this.peer = new Peer()
    this.network = []
    this.status = 'disconnected'
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
    if (this.status === 'disconnected') return
    this.status = 'disconnected'
    this.peer.destroy()
  }

  broadcast (data) {
    this.network.forEach(p => p.conn.send(data))
  }

  _setDefaultName () {
    const name = sillyname()
    eventBus.emit(EVENTS.SET_DEFAULT_NAME, name)
    return name
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

  _initSession (id) {
    this.status = 'connected'
    removeIdFromUrl()
    this.monacoCollabAdapter = new MonacoCollabAdapter(this.broadcast.bind(this), this.peer.id)
    loadSessionId(id || this.peer.id)
    updateParticipants.call(this)
    showSessionContent('connected')
  }

  _disconnectSession () {
    removeIdFromUrl()
    showSessionContent('disconnected')
    removeParticipants()
    loadSessionId('')
    this.monacoCollabAdapter.reset()
  }

  _onPeerOpen () {
    this.peer.on('open', (id) => {
      if (this.target) return this.connect(this.target)
      this._initSession()
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
      this._disconnectSession()
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
        SESSION_EVENTS[d.type].call(this, conn, d)
      })
    })
  }

  _onConnectionClose (conn) {
    conn.on('close', () => {
      this.monacoCollabAdapter.removeRemoteCursor(conn.peer)
      this.monacoCollabAdapter.removeRemoteSelection(conn.peer)
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
    updateParticipants.call(this)
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
    updateParticipants.call(this)
  }

  _setData ([rawHtml, rawCss, rawJs]) {
    const { html: htmlEditor, css: cssEditor, js: jsEditor } = getEditors()
    htmlEditor.setValue(rawHtml ? decode(rawHtml) : '')
    cssEditor.setValue(rawCss ? decode(rawCss) : '')
    jsEditor.setValue(rawJs ? decode(rawJs) : '')
  }
}
