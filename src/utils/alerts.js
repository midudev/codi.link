export const alert = (animation, message, timeout, animationOut) => {
  const overlay = document.createElement('div')
  const box = document.createElement('div')

  const createElementAndRemove = () => {
    overlay.className = 'overlay-alert scale-up-center'
    overlay.appendChild(box)
    box.className = `box-alert ${animation}`
    box.textContent = `${message}`
    document.body.appendChild(overlay)

    setTimeout(() => {
      box.classList.remove(animation)
      box.classList.add(animationOut)
      setTimeout(() => {
        document.body.removeChild(overlay)
      }, 300)
    }, timeout)
  }
  return createElementAndRemove()
}
