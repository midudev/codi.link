import { monaco } from '../../index'

const EMPTY_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]

export default {
  wordPattern:
    // eslint-disable-next-line
    /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,

  comments: {
    blockComment: ['<!--', '-->']
  },

  brackets: [
    ['<!--', '-->'],
    ['<', '>'],
    ['{', '}'],
    ['(', ')']
  ],

  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],

  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '<', close: '>' }
  ],

  onEnterRules: [
    {
      beforeText: new RegExp(
        `<(?!(?:${EMPTY_ELEMENTS.join(
          '|'
        )}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
        'i'
      ),
      afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
      action: {
        indentAction: monaco.languages.IndentAction.IndentOutdent
      }
    },
    {
      beforeText: new RegExp(
        `<(?!(?:${EMPTY_ELEMENTS.join(
          '|'
        )}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
        'i'
      ),
      action: { indentAction: monaco.languages.IndentAction.Indent }
    }
  ],

  folding: {
    markers: {
      // eslint-disable-next-line
      start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
      // eslint-disable-next-line
      end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->"),
    }
  }
}
