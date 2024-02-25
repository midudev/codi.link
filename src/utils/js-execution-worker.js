/* eslint-disable no-undef */

function evalUserCode (code) {
  const consolePattern = /console\.\w+\(([^)]|\n)*\);?/g
  const whileTruePattern = /(?<!\/\/.*)(while\s*\(\s*true\s*\))\s*(?!\{\s*\})/

  /**
   * Avoiding printing logs in the browser console
   * that are already printed in the app console
   */
  const parsedCode = code
    .replace(consolePattern, (match) => {
      return `/* ${match.trim()} */\n`
    })

  try {
    if (whileTruePattern.test(parsedCode)) {
      return { success: false, error: 'Code contains infinite loop' }
    }

    // eslint-disable-next-line no-new-func
    const func = new Function(parsedCode)
    const result = func()
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

self.onmessage = function (e) {
  const userCode = e.data.code
  const { success, result, error } = evalUserCode(userCode)

  if (success) {
    self.postMessage({ result })
  } else {
    self.postMessage({ error })
  }
}
