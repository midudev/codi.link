const HTML_LANGUAGE_ID = 'html'

// https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
const EMPTY_HTML_TAGS = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]

export const registerAutoCompleteHTMLTag = (monaco) => {
  monaco.languages.registerCompletionItemProvider(HTML_LANGUAGE_ID, completionProvider(monaco))
}

const completionProvider = (monaco) => {
  return {
    triggerCharacters: ['>'],
    provideCompletionItems: (model, position) => {
      const tagName = getMatchingTagName({ model, position })
      const isEmptyTag = checkIsEmptyTag(tagName)

      if (!tagName || isEmptyTag) {
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

  return textFromCurrentLineUntilPosition.match(/.*<(\w+).*>$/)?.[1]
}

const checkIsEmptyTag = (tagName) => EMPTY_HTML_TAGS.includes(tagName)

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
