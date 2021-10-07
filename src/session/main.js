import Session from './session'
import * as SessionDOM from './dom'
import { getSessionId } from '../utils/url'
import { getState } from '../state'

let session = null
const target = getSessionId()
if (target) session = new Session('guest', null, target)

const ACTIONS = {
  'share-session': () => {
    session = new Session('owner', getState().settings.userName, null)
  },
  'join-session': () => {},
  'remove-participant': (label) => {
    session.removeParticipant(label)
  },
  'disconnect-session': () => {
    session.close()
  },
  'copy-session-link': (button) => {
    let sessionId = ''
    if (session.role === 'owner') sessionId = session.peer.id
    if (session.role === 'guest') sessionId = session.network.find(c => c.role === 'owner').conn.peer
    navigator.clipboard.writeText(`${window.location.origin}/?join=${sessionId}`)
    const [tooltip] = button.children
    tooltip.innerHTML = 'Copied to clipboard!'
    setTimeout(() => {
      tooltip.innerHTML = 'Copy session link'
    }, 1500)
  }
}

SessionDOM.joinForm.addEventListener('submit', (e) => {
  e.preventDefault()
  session = new Session('guest', getState().settings.userName, SessionDOM.sessionInput.value)
})

SessionDOM.buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action')
    ACTIONS[action](button)
  })
})

SessionDOM.sessionDetails.addEventListener('click', (e) => {
  const { tagName } = e.target
  if (!['path', 'g', 'svg', 'BUTTON'].includes(tagName)) return
  const maxNesting = 3
  for (let i = 0; i < maxNesting; i++) {
    if (e.path[i].matches('.icon-button')) {
      const action = e.path[i].getAttribute('data-action')
      if (action === 'remove-participant') {
        const li = e.path[i].parentElement
        const label = li.getAttribute('data-label')
        ACTIONS['remove-participant'](label)
      }
      return
    }
  }
})
