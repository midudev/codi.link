const $aside = document.querySelector('aside')

const $views = document.querySelectorAll('view')
const $buttons = $aside.querySelectorAll('button')

$buttons.forEach(button => {
  button.addEventListener('click', () => {
    const elementIdToShow = button.getAttribute('data-go')
    $views.forEach(view => view.setAttribute('hidden'))
    document.getElementById(elementIdToShow).removeAttribute('hidden')
  })
})
