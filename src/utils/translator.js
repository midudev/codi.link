import en from '../language/en'
import es from '../language/es'

const translations = {
  en,
  es
}

function makeTranslation (key, language) {
  return translations[language][key] || key
}

function updateContent (language = 'en') {
  const elements = document.querySelectorAll('[data-translate]')
  elements.forEach(element => {
    const key = element.getAttribute('data-translate')
    element.innerText = makeTranslation(key, language)
  })
}

function translate (language) {
  updateContent(language)
}

export { translate }
