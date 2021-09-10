// @ts-check

/**
 * Function to create a debounce function
 * @param {function} func Function to debounce
 * @param {number} msWait Number of milliseconds to wait before calling function
 * @returns {function} Debounce function
 */
export default function debounce (func, msWait) {
  let timeout
  return function (...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), msWait)
  }
}
