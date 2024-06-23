/**
 * Change the language used in the workbench.
 * @param {'en' | 'es' | 'pt'} language
 */

const setLanguage = language => {
  document.documentElement.setAttribute('data-language', language)
}

export default setLanguage
