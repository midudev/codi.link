import * as monaco from 'monaco-editor'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'

export async function loadTokenizator (editor) {
  try {
    await loadWASM(onigasmWasm)
  } catch (err) {
    console.error('Failed to load onigasm WASM:', err)
  }

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      const lang = scopeName.split('.')[1]
      return {
        format: 'json',
        content: await (await fetch(`../../../statics/grammars/${lang}.tmLanguage.json`)).text()
      }
    }
  })

  const grammars = new Map()
  grammars.set('css', 'source.css')
  grammars.set('html', 'text.html.basic')
  grammars.set('javascript', 'source.js')

  try {
    await wireTmGrammars(monaco, registry, grammars, editor)
  } catch (wireErr) {
    console.error('Failed to wire TextMate grammars:', wireErr)
  }
}
