// @ts-check

/**
 * Function to create a debounce function
 * @param {function} func Function to debounce
 * @param {number} msWait Number of milliseconds to wait before calling function
 * @returns {function} Debounce function
 */
export default function debounce (func, msWait) {
  let timeout

  function debounced (...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = undefined
      func.apply(context, args)
    }, msWait)
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
    timeout = undefined
  }

  debounced.flush = (...args) => {
    clearTimeout(timeout)
    timeout = undefined
    func.apply(this, args)
  }

  return debounced
}
