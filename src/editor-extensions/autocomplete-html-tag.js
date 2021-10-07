const HTML_LANGUAGE_ID = 'html'

export const registerAutoCompleteHTMLTag = (monaco) => {
  monaco.languages.registerCompletionItemProvider(HTML_LANGUAGE_ID, completionProvider(monaco))
}

const completionProvider = (monaco) => {
  return {
    triggerCharacters: ['>'],
    provideCompletionItems: (model, position) => {
      const tagName = getMatchingTagName({ model, position })

      if (!tagName) {
        return
      }

      return buildCompletionList({ tagName, position }, monaco)
    }
  }
}

const getMatchingTagName = ({ model, position: { lineNumber, column } }) => {
  const textFromCurrentLineUntilPosition = model.getValueInRange({
    startLineNumber: lineNumber,
    endLineNumber: lineNumber,
    startColumn: 1,
    endColumn: column
  })

  return textFromCurrentLineUntilPosition.match(/.*<(\w+)>$/)?.[1]
}

const buildCompletionList = ({ tagName, position: { lineNumber, column } }, monaco) => {
  const closingTag = `</${tagName}>`
  const insertTextSnippet = `$0${closingTag}`
  const rangeInCurrentPosition = {
    startLineNumber: lineNumber,
    endLineNumber: lineNumber,
    startColumn: column,
    endColumn: column
  }

  return {
    suggestions: [
      {
        label: closingTag,
        kind: monaco.languages.CompletionItemKind.EnumMember,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: insertTextSnippet,
        range: rangeInCurrentPosition
      }
    ]
  }
}
