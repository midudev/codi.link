export const generateConsoleScript = () => {
  return `<script>
    const customConsole = (w) => {
      const pushToConsole = (payload, type) => {
        w.parent.postMessage({
          console: {
            payload: JSON.stringify(payload),
            type:    type
          }
        }, "*")
      }

      pushToConsole("clear", "system")

      w.onerror = (message, url, line, column) => {
        pushToConsole({line, column, message}, "error")
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
