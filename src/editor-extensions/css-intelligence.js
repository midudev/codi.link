const HTML_LANGUAGE_ID = 'html'

export const registerCSSIntelligence = (monaco) => {
  monaco.languages.registerCompletionItemProvider(HTML_LANGUAGE_ID, completionProvider(monaco))
}

const completionProvider = (monaco) => {
  return {
    triggerCharacters: ['"', "'", ' '],
    provideCompletionItems: (model, position) => {
      const className = getMatchingAttr({ model, position })

      if (!className) {
        return
      }

      return buildCompletionList({ className, position }, monaco)
    }
  }
}

const getMatchingAttr = ({ model, position: { lineNumber, column } }) => {
  const textFromCurrentLineUntilPosition = model.getValueInRange({
    startLineNumber: lineNumber,
    endLineNumber: lineNumber,
    startColumn: 1,
    endColumn: column
  })
  const classMatchRegex = /class=["|']([\w- ]*$)/

  return textFromCurrentLineUntilPosition.match(classMatchRegex)?.[1]
}

const buildCompletionList = ({ className, position: { lineNumber, column } }, monaco) => {
  const models = monaco.editor.getModels()
  const cssModels = models.find(model => model.getModeId() === 'css')
  const cssValue = cssModels?.getValue()

  // Get all classes from the css file
  const classes = cssValue?.match(/^\.[\w-]+/gm) || []

  const filteredClasses = classes.filter(name => name.startsWith(`.${className}`))

  // Remove duplicates
  const uniqueClasses = [...new Set(filteredClasses)]

  // Build the completion list
  const suggestions = uniqueClasses.map(filteredClass => ({
    label: filteredClass.slice(1),
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: filteredClass.slice(1),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: {
      startLineNumber: lineNumber,
      startColumn: column - className.length,
      endLineNumber: lineNumber,
      endColumn: column
    }
  }))

  return {
    suggestions
  }
}
