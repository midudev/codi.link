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
        }
      }

      window.console = { ...window.console, ...console }
    }

    if (window.parent){
      customConsole(window)
    }
  </script>`
}
