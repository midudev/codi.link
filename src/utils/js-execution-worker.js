/* eslint-disable no-undef */

function evalUserCode (code) {
  const consolePattern = /console\.\w+\(([^)]|\n)*\);?/g
  const whileTruePattern = /(?<!\/\/.*)(while\s*\(\s*true\s*\))\s*(?!\{\s*\})/
  const forLoopPattern = /for\s*\(\s*[^;]*;\s*[^;]*;\s*\)\s*\{/g
  const whileLoopPattern = /while\s*\(\s*[^)]*\)\s*\{/g

  // check for common infinite loop patterns
  if (whileTruePattern.test(code)) {
    return { success: false, error: 'Code contains infinite loop: while(true)' }
  }

  // check for for loops without increment
  if (forLoopPattern.test(code)) {
    return { success: false, error: 'Code contains potential infinite loop: for loop without increment' }
  }

  // check for while loops without break condition
  if (whileLoopPattern.test(code)) {
    return { success: false, error: 'Code contains potential infinite loop: while loop without proper break condition' }
  }

  /**
   * Avoiding printing logs in the browser console
   * that are already printed in the app console
   */
  const parsedCode = code
    .replace(consolePattern, (match) => {
      return `/* ${match.trim()} */\n`
    })

  try {
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
