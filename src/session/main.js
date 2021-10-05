import sillyname from 'https://cdn.skypack.dev/sillyname'

import Session from './session'
import * as SessionDOM from './dom'
import { getSessionId } from '../utils/url'

let session = null
const target = getSessionId()
if (target) session = new Session('guest', null, target)

const ACTIONS = {
  'generate-name': () => {
    SessionDOM.usernameInput.value = sillyname()
  },
  'share-session': () => {
    session = new Session('owner', SessionDOM.usernameInput.value, null)
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

SessionDOM.joinForm.addEventListener('submit', (e) => {
  e.preventDefault()
  session = new Session('guest', SessionDOM.usernameInput.value, SessionDOM.sessionInput.value)
})

SessionDOM.buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action')
    ACTIONS[action]()
  })
})
