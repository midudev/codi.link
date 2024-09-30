import en from '../language/en'
import es from '../language/es'
import pt from '../language/pt'

const translations = {
  en,
  es,
  pt
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

function updatePlaceholders (language = 'en') {
  const elements = document.querySelectorAll('[data-translate-placeholder]')
  elements.forEach(element => {
    const key = element.getAttribute('data-translate-placeholder')
    element.placeholder = makeTranslation(key, language)
  })
}

function translate (language) {
  updateContent(language)
  updatePlaceholders(language)
}

export { translate }
