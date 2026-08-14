import * as monaco from 'monaco-editor/editor/editor.api'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'
import HtmlWorker from 'monaco-editor/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/language/typescript/ts.worker?worker'
import { javascriptDefaults, ScriptTarget } from 'monaco-editor/languages/features/typescript/register.js'
import { registerAutoCompleteHTMLTag } from './extensions/autocomplete-html-tag.js'
import { registerThemes } from './extensions/register-themes.js'

import 'monaco-editor/languages/definitions/html/register.js'
import 'monaco-editor/languages/definitions/css/register.js'
import 'monaco-editor/languages/definitions/javascript/register.js'
import 'monaco-editor/languages/features/html/register.js'
import 'monaco-editor/languages/features/css/register.js'

import 'monaco-editor/editor/browser/coreCommands.js'
import 'monaco-editor/editor/browser/widget/codeEditor/codeEditorWidget.js'
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js'
import 'monaco-editor/editor/contrib/caretOperations/browser/caretOperations.js'
import 'monaco-editor/editor/contrib/clipboard/browser/clipboard.js'
import 'monaco-editor/editor/contrib/comment/browser/comment.js'
import 'monaco-editor/editor/contrib/contextmenu/browser/contextmenu.js'
import 'monaco-editor/editor/contrib/cursorUndo/browser/cursorUndo.js'
import 'monaco-editor/editor/contrib/find/browser/findController.js'
import 'monaco-editor/editor/contrib/folding/browser/folding.js'
import 'monaco-editor/editor/contrib/fontZoom/browser/fontZoom.js'
import 'monaco-editor/editor/contrib/format/browser/formatActions.js'
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution.js'
import 'monaco-editor/editor/contrib/indentation/browser/indentation.js'
import 'monaco-editor/editor/contrib/lineSelection/browser/lineSelection.js'
import 'monaco-editor/editor/contrib/linesOperations/browser/linesOperations.js'
import 'monaco-editor/editor/contrib/linkedEditing/browser/linkedEditing.js'
import 'monaco-editor/editor/contrib/links/browser/links.js'
import 'monaco-editor/editor/contrib/multicursor/browser/multicursor.js'
import 'monaco-editor/editor/contrib/parameterHints/browser/parameterHints.js'
import 'monaco-editor/editor/contrib/smartSelect/browser/smartSelect.js'
import 'monaco-editor/editor/contrib/snippet/browser/snippetController2.js'
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js'
import 'monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js'
import 'monaco-editor/editor/contrib/wordPartOperations/browser/wordPartOperations.js'
import 'monaco-editor/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js'
import 'monaco-editor/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'
import 'monaco-editor/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js'

let initialized = false

export function initMonaco () {
  if (initialized) return monaco

  window.MonacoEnvironment = {
    getWorker (_, label) {
      switch (label) {
        case 'html': return new HtmlWorker()
        case 'css': return new CssWorker()
        case 'javascript':
        case 'typescript':
          return new JsWorker()
        default: return new EditorWorker()
      }
    }
  }

  javascriptDefaults.setCompilerOptions({
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: false,
    target: ScriptTarget.ESNext,
    lib: ['esnext', 'dom']
  })

  registerThemes(monaco)
  registerAutoCompleteHTMLTag(monaco)
  initialized = true

  return monaco
}

let emmetReady = false

export function ensureEmmet () {
  if (emmetReady) return

  emmetReady = true
  import('emmet-monaco-es').then(({ emmetHTML }) => {
    emmetHTML(monaco)
  })
}

export { monaco }
