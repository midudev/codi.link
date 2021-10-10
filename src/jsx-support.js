import { transform } from '@babel/standalone'
import pluginReact from '@babel/preset-react'

export default function (code) {
  return transform(code, {
    babelrc: false,
    configFile: false,
    ast: false,
    highlightCode: true,
    presets: [pluginReact]
  }).code
}
