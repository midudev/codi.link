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

      const counts = {}
      const timers = {}

      const console = {
        log: function(...args){
          pushToConsole(args, "log:log")
        },
        error: function(...args){
          pushToConsole(args, "log:error")
        },
        warn: function(...args){
          pushToConsole(args, "log:warn")
        },
        info: function(...args){
          pushToConsole(args, "log:info")
        },
        debug: function(...args){
          pushToConsole(args, "log:debug")
        },
        table: function(data){
          pushToConsole([data], "log:table")
        },
        count: function(label = 'default'){
          counts[label] = (counts[label] || 0) + 1
          pushToConsole([label + ": " + counts[label]], "log:count")
        },
        countReset: function(label = 'default'){
          counts[label] = 0
        },
        trace: function(...args){
          const stack = new Error().stack
          pushToConsole([...args, stack], "log:trace")
        },
        dir: function(obj){
          pushToConsole([obj], "log:dir")
        },
        dirxml: function(obj){
          pushToConsole([obj], "log:dirxml")
        },
        time: function(label = 'default'){
          timers[label] = performance.now()
        },
        timeEnd: function(label = 'default'){
          if (timers[label]) {
            const duration = performance.now() - timers[label]
            pushToConsole([label + ": " + duration.toFixed(2) + "ms"], "log:time")
            delete timers[label]
          }
        },
        timeLog: function(label = 'default', ...args){
          if (timers[label]) {
            const duration = performance.now() - timers[label]
            pushToConsole([label + ": " + duration.toFixed(2) + "ms"].concat(args), "log:time")
          }
        },
        assert: function(condition, ...args){
          if (!condition) {
            pushToConsole(["Assertion failed:", ...args], "log:assert")
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
