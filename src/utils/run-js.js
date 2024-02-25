export default function runJs (code, timeout = 200) {
  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    const worker = new window.Worker(new URL('./js-execution-worker.js', import.meta.url))

    const logError = (message) => {
      window.parent.postMessage({
        console: {
          type: 'loop',
          payload: { message }
        }
      }, document.location.origin)
    }

    const timeoutId = setTimeout(() => {
      worker.terminate()
      logError('Process terminated to avoid infinite loop')

      const executionTime = Date.now() - startTime
      reject(new Error(`Execution timed out after ${executionTime}ms`))
    }, timeout)

    worker.onmessage = (e) => {
      clearTimeout(timeoutId)

      const data = e.data
      worker.terminate()

      if (data.error) {
        logError(data.error)
        // reject(data.error)
      }

      resolve(data.result)
    }

    worker.postMessage({ code })
  })
}
