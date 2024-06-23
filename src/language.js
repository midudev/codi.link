import { translate } from './utils/translator.js'

/**
 * Change the language used in the workbench.
 * @param {'en' | 'es' | 'pt'} language
 */
const setLanguage = language => {
  document.documentElement.setAttribute('data-language', language)
  translate(language)
}

export default setLanguage
