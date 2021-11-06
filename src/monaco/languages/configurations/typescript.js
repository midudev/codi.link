import { monaco } from '../../index'

export default {
  wordPattern:
    // eslint-disable-next-line
    /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },

  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],

  onEnterRules: [
    {
      // e.g. /** | */
      // eslint-disable-next-line
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      afterText: /^\s*\*\/$/,
      action: {
        indentAction: monaco.languages.IndentAction.IndentOutdent,
        appendText: ' * '
      }
    },
    {
      // e.g. /** ...|
      // eslint-disable-next-line
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      action: {
        indentAction: monaco.languages.IndentAction.None,
        appendText: ' * '
      }
    },
    {
      // e.g.  * ...|
      // eslint-disable-next-line
      beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
      action: {
        indentAction: monaco.languages.IndentAction.None,
        appendText: '* '
      }
    },
    {
      // e.g.  */|
      // eslint-disable-next-line
      beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
      action: {
        indentAction: monaco.languages.IndentAction.None,
        removeText: 1
      }
    }
  ],

  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
    { open: '`', close: '`', notIn: ['string', 'comment'] },
    { open: '/**', close: ' */', notIn: ['string'] }
  ],

  folding: {
    markers: {
      // eslint-disable-next-line
      start: new RegExp("^\\s*//\\s*#?region\\b"),
      // eslint-disable-next-line
      end: new RegExp("^\\s*//\\s*#?endregion\\b"),
    }
  }
}
