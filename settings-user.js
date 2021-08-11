const $ = (selector) => document.querySelector(selector)

const $modal = $('#open-modal')
const $closeModal = $('#close-modal')
const isVisible = 'is-visible'

const $tabLinks = document.getElementsByClassName('tablinks')

// Settings User
export const $settingsUserForm = $('#settings-user')

$modal.addEventListener('click', function () {
  const modalId = this.dataset.open
  document.getElementById(modalId).classList.add(isVisible)
})

// Close modal
$closeModal.addEventListener('click', function () {
  this.parentElement.parentElement.parentElement.classList.remove(isVisible)
})

document.addEventListener('click', (e) => {
  if (e.target === document.querySelector('.modal.is-visible')) {
    document.querySelector('.modal.is-visible').classList.remove(isVisible)
  }
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape' && document.querySelector('.modal.is-visible')) {
    document.querySelector('.modal.is-visible').classList.remove(isVisible)
  }
})

export function updateEditorOptions ({ htmlEditor, cssEditor, jsEditor, COMMON_EDITOR_OPTIONS }) {
  htmlEditor.updateOptions({
    ...COMMON_EDITOR_OPTIONS
  })
  cssEditor.updateOptions({
    ...COMMON_EDITOR_OPTIONS
  })
  jsEditor.updateOptions({
    ...COMMON_EDITOR_OPTIONS
  })
}

for (let i = 0; i < $tabLinks.length; i++) {
  $tabLinks[i].addEventListener('click', e => {
    const id = e.target.id

    const $tabContents = document.getElementsByClassName('tabcontent')

    for (let j = 0; j < $tabContents.length; j++) {
      $tabContents[j].classList.remove('show')
      $tabContents[j].classList.add('hidde')

      if (id.concat('-content') === $tabContents[j].getAttribute('id')) {
        $tabContents[j].classList.remove('hidde')
        $tabContents[j].classList.add('show')
      }
    }
  })
}
