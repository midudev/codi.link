export default function debounce (func, msWait) {
  let timeout
  return function (...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), msWait)
  }
}
