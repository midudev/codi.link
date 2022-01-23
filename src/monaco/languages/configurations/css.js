export default {
  wordPattern: /(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,

  comments: {
    blockComment: ['/*', '*/']
  },

  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],

  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] }
  ],

  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],

  folding: {
    markers: {
      start: /^\s*\/\*\s*#region\b\s*(.*?)\s*\*\//,
      end: /^\s*\/\*\s*#endregion\b.*\*\//
    }
  }
}
