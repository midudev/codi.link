import Peer from 'peerjs'
import { getSessionId } from './utils/url'

class Session {
  constructor (targetId) {
    this.targetId = targetId
    this.peer = new Peer()
    this.network = []
    this._onOpen()
  }

  connect (id) {
    const conn = this.peer.connect(id)
    conn.on('open', () => {
      console.log(`Connected to ${id}`)
      this._addToNetwork(conn)
      this._onData(conn)
    })
  }

  broadcast (data) {
    this.network.forEach(c => c.send(data))
  }

  _onOpen () {
    this.peer.on('open', (id) => {
      console.info('Peer ID: ' + id)
      if (this.targetId) this.connect(this.targetId)
    })
  }

  _onConnection () {
    this.peer.on('connection', (conn) => {
      console.log('Receiving connection')
      this._addToNetwork(conn)
      this._onData(conn)
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

const targetId = getSessionId()
const session = new Session(targetId)
console.log(session)
