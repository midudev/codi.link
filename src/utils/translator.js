import en from '../language/en'
import es from '../language/es'
import pt from '../language/pt'
import { $$ } from './dom.js'

const translations = {
  en,
  es,
  pt
}

function makeTranslation (key, language) {
  return translations[language]?.[key] || translations.en?.[key] || key
}

export function getTranslation (key, language = 'en') {
  return makeTranslation(key, language)
}

function updateContent (language = 'en') {
  $$('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate')
    element.innerText = makeTranslation(key, language)
  })
}

function updatePlaceholders (language = 'en') {
  $$('[data-translate-placeholder]').forEach(element => {
    const key = element.getAttribute('data-translate-placeholder')
    element.placeholder = makeTranslation(key, language)
  })
}

function updateAriaLabels (language = 'en') {
  $$('[data-translate-aria]').forEach(element => {
    const key = element.getAttribute('data-translate-aria')
    element.setAttribute('aria-label', makeTranslation(key, language))
  })
}

function translate (language) {
  updateContent(language)
  updatePlaceholders(language)
  updateAriaLabels(language)
}

export { translate }
