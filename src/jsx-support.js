import { transform } from '@babel/standalone'
import presetReact from '@babel/preset-react'
import { getState } from './state.js'

export default function (code) {
  const { jsxEnabled, jsxPragma, jsxPragmaFrag } = getState()

  if (!jsxEnabled) return code

  return transform(code, {
    babelrc: false,
    configFile: false,
    ast: false,
    highlightCode: false,
    presets: [
      [
        presetReact,
        {
          pragma: jsxPragma,
          pragmaFrag: jsxPragmaFrag
        }
      ]
    ]
  }).code
}
