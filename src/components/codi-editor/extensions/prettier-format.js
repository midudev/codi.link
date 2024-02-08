import prettierBabel from 'prettier/plugins/babel'
import prettierEstree from 'prettier/plugins/estree'
import prettierHtml from 'prettier/plugins/html'
import prettierPostcss from 'prettier/plugins/postcss'
import * as prettier from 'prettier/standalone'

async function formatCode (model, options) {
  try {
    const text = model.getValue()
    const result = await prettier.format(text, options)
    return [{ text: result, range: model.getFullModelRange() }]
  } catch (error) {
    console.error(error)
  }
}

export function registerPrettierFormat (monaco) {
  const { languages } = monaco
  const { cssDefaults } = languages.css
  const { htmlDefaults } = languages.html
  cssDefaults.setModeConfiguration({
    ...cssDefaults.modeConfiguration,
    documentFormattingEdits: false
  })
  htmlDefaults.setModeConfiguration({
    ...htmlDefaults.modeConfiguration,
    documentFormattingEdits: false
  })
  languages.registerDocumentFormattingEditProvider(
    ['javascript', 'css', 'html'],
    {
      displayName: 'Prettier',
      provideDocumentFormattingEdits (model) {
        const languageId = model.getLanguageId()

        const options = { parser: languageId }

        if (languageId === 'javascript') {
          options.parser = 'babel'
          options.plugins = [prettierBabel, prettierEstree]
        } else if (languageId === 'css') {
          options.plugins = [prettierPostcss]
        } else if (languageId === 'html') {
          options.plugins = [prettierHtml]
        }

        return formatCode(model, options)
      }
    }
  )
}
