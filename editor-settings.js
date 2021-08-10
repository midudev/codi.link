const EDITORS = []
const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28]
const options = [
  { title: 'Minimap', name: 'minimap', type: 'checkbox' },
  { title: 'Word wrap', name: 'wordWrap', type: 'checkbox' },
  { title: 'Line numbers', name: 'lineNumbers', type: 'checkbox' }
]

export function registerEditors (editors = []) {
  editors.forEach((editor, index) => {
    EDITORS[index] = editor
  })
}

export function handleShowSettingsPanel ($shower) {
  let $panel = document.querySelector('.editor-settings-panel')

  if ($panel !== null) {
    hiddenPanel($panel)
    return
  }

  $panel = createPanel()
  document.body.appendChild($panel)
  initializeActionsOfPanel($panel)
}

function createPanel () {
  const $panel = document.createElement('panel')
  const editorOptions = EDITORS[0].getRawOptions()

  $panel.setAttribute('class', 'editor-settings-panel')
  $panel.innerHTML = `
    <header>
      <svg width="14" height="14" fill="none" id="editor-option-close"><path d="M1 1l12 12M1 13L13 1 1 13z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h3>Editor Settings</h3>
    </header>
    <section>
      ${
        options.map(({ title, type, name }) => {
          const isChecked = name === 'minimap'
            ? editorOptions[name].enabled
            : editorOptions[name] === 'on'
          return (
            `<label class="editor-settings-panel-option">
              <span>${title}</span>
              <input type="${type}" class="setting-option" name="${name}" ${isChecked ? 'checked' : ''}>
            </label>`
          )
        }).join('')
      }
      <label class="editor-settings-panel-option">
        <span>Font size</span>
        <select class="setting-option" name="fontSize">
          ${
            fontSizes.map(size => (
              `<option value="${size}" ${editorOptions.fontSize === size ? 'selected' : ''}>${size}px</option>`
            )).join('')
          }
        </select>
      </label>
    </section>
  `
  return $panel
}

function hiddenPanel ($node) {
  document.body.removeChild($node)
}

function initializeActionsOfPanel ($panel) {
  const $close = $panel.querySelector('#editor-option-close')
  const $settingsOptions = $panel.querySelectorAll('.setting-option')

  $close.addEventListener('click', () => {
    hiddenPanel($panel)
  })

  $settingsOptions.forEach(option => {
    option.addEventListener('change', (evt) => {
      const { name, checked, type } = evt.target
      const value = type === 'checkbox' ? checked : parseInt(option.value)
      updateOptionsEditor([name, value])
    })
  })
}

function updateOptionsEditor ([key, value]) {
  EDITORS.forEach(editor => {
    const option = key === 'minimap'
      ? { minimap: { enabled: value } }
      : { [key]: value }
    editor.updateOptions({
      ...editor.getRawOptions(),
      ...option
    })
  })
}
