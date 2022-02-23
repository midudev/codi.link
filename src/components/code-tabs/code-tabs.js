import { decode } from 'js-base64'
import { LitElement, html } from 'lit'
import { getState } from '../../state'
import { codeTabsStyles } from './code-tabs.styles'

const STORAGE_KEY = 'CODI_LINK_TABS'

export class CodeTabs extends LitElement {
  static get styles () {
    return codeTabsStyles
  }

  constructor () {
    super()

    const storageTabs = this.getStorageTabs()
    let tab = storageTabs.find(({ pathname }) => pathname === window.location.pathname)

    if (tab == null || storageTabs.length === 0) {
      tab = this.generateTab({ pathname: window.location.pathname })
      this.tabs = [tab, ...storageTabs]
    } else {
      this.tabs = [...storageTabs]
    }

    this.currentTab = tab

    window.addEventListener('beforeunload', () => {
      this.updateTab(this.currentTab.id, window.location.pathname)
      this.updateStorage()
    })
  }

  generateTab ({ name = `untitled-${this.tabs ? this.tabs.length + 1 : 1}`, pathname }) {
    return {
      id: `id-${Date.now()}`,
      name,
      pathname
    }
  }

  goToTab (pathname) {
    window.history.replaceState(null, null, pathname)
  }

  createNewTab () {
    const tab = this.generateTab({ pathname: '/' })
    this.tabs = [...this.tabs, tab]

    return tab
  }

  updateTab (id, pathname) {
    const tab = {
      ...this.tabs.find(t => t.id === id),
      pathname
    }

    const index = this.tabs.findIndex(t => t.id === id)

    this.tabs[index] = tab
  }

  deleteTab (id) {
    this.tabs = this.tabs.filter(t => t.id !== id)
  }

  handleCreateNewTab (ev) {
    const tab = this.createNewTab()

    this.handleChageTab(tab, ev)
  }

  enableChangeTabName (tab, ev) {
    ev.stopPropagation()

    const tabIndex = this.tabs.findIndex(({ id }) => id === tab.id)

    this.tabs[tabIndex] = {
      ...this.tabs[tabIndex],
      edit: true
    }

    this.requestUpdate()
  }

  handleChageTab (tab, ev) {
    ev.stopPropagation()

    this.updateTab(this.currentTab.id, window.location.pathname)

    this.goToTab(tab.pathname)

    this.currentTab = tab
    this.updateEditors(tab.pathname)
    this.updateStorage()

    this.requestUpdate()
  }

  handleDeleteTab (id, ev) {
    ev.stopPropagation()

    const index = this.tabs.findIndex(t => t.id === id)
    const tab = this.tabs[index - 1]
    this.currentTab = tab

    this.goToTab(tab.pathname)
    this.deleteTab(id)

    this.updateStorage()
    this.updateEditors()

    this.requestUpdate()
  }

  handleOnblurInput (tab, ev) {
    this.updateTabName(tab, ev.target.value)
  }

  handleOnKeyPressInput (tab, ev) {
    if (ev.key === 'Enter') {
      this.updateTabName(tab, ev.target.value)
    }
  }

  updateEditors () {
    const { editors } = getState()
    const [rawHtml, rawCss, rawJs] = decodeURIComponent(window.location.pathname).slice(1).split('|')

    editors.html.setValue(rawHtml ? decode(rawHtml) : '')
    editors.css.setValue(rawCss ? decode(rawCss) : '')
    editors.javascript.setValue(rawJs ? decode(rawJs) : '')
  }

  updateStorage () {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tabs))
  }

  updateTabName (tab, newName) {
    tab.edit = false

    if (newName.length) {
      tab.name = newName
    }

    const tabIndex = this.tabs.findIndex(({ id }) => id === tab.id)
    this.tabs[tabIndex] = tab

    this.requestUpdate()
  }

  getStorageTabs () {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? []
  }

  render () {
    return html`
      <nav class="nav" @click="${this.handleCreateNewTab}">
        <ul class="codeTabs">
          ${
            this.tabs.map((tab, index) => html`
              <li
                @click="${this.handleChageTab.bind(this, tab)}"
                @dblclick="${this.enableChangeTabName.bind(this, tab)}"
                class="codeTabs__tab ${this.currentTab.id === tab.id ? 'codeTabs__tab-active' : ''}"
              >
                ${
                  !tab.edit
                    ? html`
                      <span class="codeTabs__tab__text" editable="true">
                        ${tab.name}
                      </span>
                    `
                    : html`
                        <input
                          type="text"
                          class="codeTabs__tab__input"
                          value=${tab.name}
                          @blur="${this.handleOnblurInput.bind(this, tab)}"
                          @keyup=${this.handleOnKeyPressInput.bind(this, tab)}
                          autofocus
                        />
                      `
                }

                ${
                  index > 0
                    ? html`
                    <button
                      class="codeTabs__tab__button"
                      @click="${this.handleDeleteTab.bind(this, tab.id)}"
                    >
                      X
                    </button>`
                    : ''
                }
              </li>
            `)
          }
          <li
            id="last-tab"
            @click="${this.handleCreateNewTab}"
            class="codeTabs__addNewtab codeTabs__tab"
          ></li>
        </ul>
      </nav>
      ${this.children}
    `
  }
}
