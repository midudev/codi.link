import en from '../language/en'
import es from '../language/es'

const translations = {
  en,
  es
}

function translate (key, language) {
  return translations[language][key] || key
}

export { translate }
