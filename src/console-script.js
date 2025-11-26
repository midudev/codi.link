export const generateConsoleScript = ({ html, css }) => {
  return `<script>
    const customConsole = (w) => {
      const pushToConsole = (payload, type) => {
        w.parent.postMessage({
          console: {
            payload: payload,
            type:    type
          }
        }, "*")
      }

      pushToConsole("clear", "system")

      w.onerror = (message, url, line, column) => {
        const DEFAULT_LINE_HEIGHT = 53
        const htmlLines = ${html.split('\n').length}
        const cssLines = ${css.split('\n').length}
        const fixedLine = line - DEFAULT_LINE_HEIGHT - htmlLines - cssLines
        pushToConsole({line:fixedLine, column, message}, "error")
      }

      const encodeFunction = (fn) => ({
        type: 'function',
        name: fn.name || '(anonymous)',
        async: fn.constructor?.name === 'AsyncFunction',
        generator: fn.constructor?.name === 'GeneratorFunction',
        content: fn.toString()
      })

      const encode = (value, seen) => {
        if (typeof value === 'function') return encodeFunction(value)
        
        // primitives
        if (value === null || typeof value !== 'object') return value

        // circular detection
        if (seen.has(value)) return { type: 'circular' }
        seen.add(value)
        
        if (Array.isArray(value)) {
          return value.map(item => encode(item, seen))
        }

        if (value instanceof RegExp) {
          return { type: 'regexp', value: value.toString() }
        }

        if (value instanceof Date) {
          return { type: 'date', value: value.toISOString() }
        }

        if (value instanceof Set) {
          const values = []
          for (const v of value.values()) {
            values.push(encode(v, seen))
          }
          return { type: 'set', size: value.size, values }
        }

        if (value instanceof Map) {
          const entries = []
          for (const [k, v] of value.entries()) {
            entries.push([encode(k, seen), encode(v, seen)])
          }
          return { type: 'map', size: value.size, entries }
        }

        if (value.constructor === Object) {
          const out = {}
          const keys = Reflect.ownKeys(value) // includes symbols
          
          for (const key of keys) {
            const outKey = typeof key === 'symbol' ? key.toString() : key
            out[outKey] = encode(value[key], seen)
          }

          return out
        }

        // Fallback: try to serialize toString (safe)
        try {
          return { type: 'unknown', value: value.toString() }
        } catch (e) {
          return { type: 'unknown', value: Object.prototype.toString.call(value) }
        }
      }

      const serialize = (args) => args.map(arg => encode(arg, new WeakSet()))

      const counts = {}
      const timers = {}

      const console = {
        log: function(...args){
          pushToConsole(serialize(args), "log:log")
        },
        error: function(...args){
          pushToConsole(serialize(args), "log:error")
        },
        warn: function(...args){
          pushToConsole(serialize(args), "log:warn")
        },
        info: function(...args){
          pushToConsole(serialize(args), "log:info")
        },
        debug: function(...args){
          pushToConsole(serialize(args), "log:debug")
        },
        table: function(data){
          pushToConsole(serialize([data]), "log:table")
        },
        count: function(label = 'default'){
          counts[label] = (counts[label] || 0) + 1
          pushToConsole(serialize([label + ": " + counts[label]]), "log:count")
        },
        countReset: function(label = 'default'){
          counts[label] = 0
        },
        trace: function(...args){
          const stack = new Error().stack
          pushToConsole(serialize([...args, stack]), "log:trace")
        },
        dir: function(obj){
          pushToConsole(serialize([obj]), "log:dir")
        },
        dirxml: function(obj){
          pushToConsole(serialize([obj]), "log:dirxml")
        },
        time: function(label = 'default'){
          timers[label] = performance.now()
        },
        timeEnd: function(label = 'default'){
          if (timers[label]) {
            const duration = performance.now() - timers[label]
            pushToConsole(serialize([label + ": " + duration.toFixed(2) + "ms"]), "log:time")
            delete timers[label]
          }
        },
        timeLog: function(label = 'default', ...args){
          if (timers[label]) {
            const duration = performance.now() - timers[label]
            pushToConsole(serialize([label + ": " + duration.toFixed(2) + "ms"].concat(args)), "log:time")
          }
        },
        assert: function(condition, ...args){
          if (!condition) {
            pushToConsole(serialize(["Assertion failed:", ...args]), "log:assert")
          }
        },
        clear: function(){
          pushToConsole("clear", "system")
        }
      }

      window.console = { ...window.console, ...console }
    }

    if (window.parent){
      customConsole(window)
    }
  </script>`
}
