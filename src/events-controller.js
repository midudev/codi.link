import { EventEmitter } from 'eventemitter3'
import { capitalize } from './utils/string.js'

export const EE = new EventEmitter()

let jsEditor

export const initializeEventsController = ({
  jsEditor: _jsEditor
}) => {
  jsEditor = _jsEditor
}

export const EVENTS = {
  ADD_SKYPACK_PACKAGE: 'ADD_SKYPACK_PACKAGE'
}

EE.on(EVENTS.ADD_SKYPACK_PACKAGE, ({ skypackPackage, url }) => {
  jsEditor.setValue(`import ${capitalize(skypackPackage)} from '${url}';\n${jsEditor.getValue()}`)
})
