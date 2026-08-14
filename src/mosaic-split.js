const GUTTER = 8
const MIN = 48
const SNAP = 12
const CENTER = 28

const DEFAULT_RATIOS = {
  top: 0.5,
  bottom: 0.5,
  left: 0.5,
  right: 0.5
}

const SNAP_PAIR = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const intersect = (a, b) => {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.w, b.x + b.w)
  const bottom = Math.min(a.y + a.h, b.y + b.h)
  if (right <= x || bottom <= y) return null
  return { x, y, w: right - x, h: bottom - y }
}

const clipPathExclude = (box, hole) => {
  if (!hole) return ''

  const x = hole.x - box.x
  const y = hole.y - box.y
  const { w, h } = hole
  const W = box.w
  const H = box.h
  const atLeft = x <= 0.5
  const atTop = y <= 0.5
  const atRight = x + w >= W - 0.5
  const atBottom = y + h >= H - 0.5

  if (atTop && atRight) {
    return `polygon(0 0, ${x}px 0, ${x}px ${y + h}px, ${W}px ${y + h}px, ${W}px ${H}px, 0 ${H}px)`
  }
  if (atTop && atLeft) {
    return `polygon(${x + w}px 0, ${W}px 0, ${W}px ${H}px, 0 ${H}px, 0 ${y + h}px, ${x + w}px ${y + h}px)`
  }
  if (atBottom && atLeft) {
    return `polygon(0 0, ${W}px 0, ${W}px ${H}px, ${x + w}px ${H}px, ${x + w}px ${y}px, 0 ${y}px)`
  }
  if (atBottom && atRight) {
    return `polygon(0 0, ${W}px 0, ${W}px ${y}px, ${x}px ${y}px, ${x}px ${H}px, 0 ${H}px)`
  }

  return ''
}

const setBox = (element, box, clip = '') => {
  element.style.position = 'absolute'
  element.style.left = `${box.x}px`
  element.style.top = `${box.y}px`
  element.style.width = `${box.w}px`
  element.style.height = `${box.h}px`
  element.style.clipPath = clip
}

const layoutBoxes = (width, height, ratios) => {
  const maxX = Math.max(MIN, width - GUTTER - MIN)
  const maxY = Math.max(MIN, height - GUTTER - MIN)
  const x1 = clamp(ratios.top * (width - GUTTER), MIN, maxX)
  const x2 = clamp(ratios.bottom * (width - GUTTER), MIN, maxX)
  const y1 = clamp(ratios.left * (height - GUTTER), MIN, maxY)
  const y2 = clamp(ratios.right * (height - GUTTER), MIN, maxY)

  const tl = { x: 0, y: 0, w: x1, h: y1 }
  const tr = { x: x1 + GUTTER, y: 0, w: width - x1 - GUTTER, h: y2 }
  const bl = { x: 0, y: y1 + GUTTER, w: x2, h: height - y1 - GUTTER }
  const br = { x: x2 + GUTTER, y: y2 + GUTTER, w: width - x2 - GUTTER, h: height - y2 - GUTTER }

  return { tl, tr, bl, br, x1, x2, y1, y2 }
}

export function createMosaicSplit ({
  container,
  panes,
  gutters,
  initialRatios,
  onDragEnd
}) {
  const HOVER_CLASS = {
    xy: 'is-center-hover',
    x: 'is-pair-col-hover',
    y: 'is-pair-row-hover'
  }

  const ratios = { ...DEFAULT_RATIOS, ...initialRatios }
  const iframe = container.querySelector('iframe')
  let drag = null
  let pairMode = null

  const clearPairHover = () => {
    container.classList.remove('is-center-hover', 'is-pair-col-hover', 'is-pair-row-hover')
  }

  const setPairHover = (mode) => {
    clearPairHover()
    if (mode && HOVER_CLASS[mode]) container.classList.add(HOVER_CLASS[mode])
  }

  const apply = () => {
    const width = container.clientWidth
    const height = container.clientHeight
    if (width <= 0 || height <= 0) return

    const { tl, tr, bl, br, x1, x2, y1, y2 } = layoutBoxes(width, height, ratios)
    const overlapJsCss = intersect(tr, bl)
    const overlapHtmlPreview = intersect(tl, br)

    setBox(panes.tl, tl, clipPathExclude(tl, overlapHtmlPreview))
    setBox(panes.tr, tr, clipPathExclude(tr, overlapJsCss))
    setBox(panes.bl, bl, clipPathExclude(bl, overlapJsCss))
    setBox(panes.br, br, clipPathExclude(br, overlapHtmlPreview))

    setBox(gutters.colTop, {
      x: x1,
      y: 0,
      w: GUTTER,
      h: Math.max(GUTTER, Math.max(y1, y2) + GUTTER)
    })
    setBox(gutters.colBottom, {
      x: x2,
      y: Math.min(y1, y2),
      w: GUTTER,
      h: Math.max(GUTTER, height - Math.min(y1, y2))
    })
    setBox(gutters.rowLeft, {
      x: 0,
      y: y1,
      w: Math.max(GUTTER, Math.max(x1, x2) + GUTTER),
      h: GUTTER
    })
    setBox(gutters.rowRight, {
      x: Math.min(x1, x2),
      y: y2,
      w: Math.max(GUTTER, width - Math.min(x1, x2)),
      h: GUTTER
    })

    const alignedX = Math.abs(x1 - x2) <= SNAP
    const alignedY = Math.abs(y1 - y2) <= SNAP
    pairMode = alignedX && alignedY ? 'xy' : alignedX ? 'x' : alignedY ? 'y' : null

    if (gutters.center) {
      if (pairMode) {
        gutters.center.hidden = false
        gutters.center.dataset.pair = pairMode
        const cx = pairMode === 'y' ? (x1 + x2) / 2 : x1
        const cy = pairMode === 'x' ? (y1 + y2) / 2 : y1
        setBox(gutters.center, {
          x: cx + GUTTER / 2 - CENTER / 2,
          y: cy + GUTTER / 2 - CENTER / 2,
          w: CENTER,
          h: CENTER
        })
      } else {
        gutters.center.hidden = true
        delete gutters.center.dataset.pair
        if (!drag) clearPairHover()
      }
    }
  }

  const snapRatio = (ratio, key, axis, width, height) => {
    const span = (axis === 'x' ? width : height) - GUTTER
    if (span <= 0) return ratio

    const position = ratio * span
    const targets = [span * 0.5, ratios[SNAP_PAIR[key]] * span]

    let snapped = position
    let closest = SNAP

    targets.forEach((target) => {
      const distance = Math.abs(position - target)
      if (distance <= closest) {
        closest = distance
        snapped = target
      }
    })

    return clamp(snapped / span, 0, 1)
  }

  const onPointerMove = (event) => {
    if (!drag) return

    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    if (drag.pair) {
      const x = clamp((event.clientX - rect.left) / (width - GUTTER), 0, 1)
      const y = clamp((event.clientY - rect.top) / (height - GUTTER), 0, 1)
      const spanX = width - GUTTER
      const spanY = height - GUTTER
      const snappedX = Math.abs(x * spanX - spanX * 0.5) <= SNAP ? 0.5 : x
      const snappedY = Math.abs(y * spanY - spanY * 0.5) <= SNAP ? 0.5 : y

      if (drag.pair === 'xy' || drag.pair === 'x') {
        ratios.top = snappedX
        ratios.bottom = snappedX
      }
      if (drag.pair === 'xy' || drag.pair === 'y') {
        ratios.left = snappedY
        ratios.right = snappedY
      }
      apply()
      return
    }

    const raw = drag.axis === 'x'
      ? (event.clientX - rect.left) / (width - GUTTER)
      : (event.clientY - rect.top) / (height - GUTTER)

    ratios[drag.key] = snapRatio(clamp(raw, 0, 1), drag.key, drag.axis, width, height)
    apply()
  }

  const stopDrag = () => {
    if (!drag) return
    const wasPair = Boolean(drag.pair)
    drag = null
    if (iframe) iframe.style.pointerEvents = ''
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    if (wasPair && !gutters.center?.matches(':hover')) clearPairHover()
    onDragEnd?.({ ...ratios })
  }

  const startDrag = (key, axis) => (event) => {
    event.preventDefault()
    drag = { key, axis }
    if (iframe) iframe.style.pointerEvents = 'none'
    document.body.style.userSelect = 'none'
    document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize'
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const startPairDrag = (event) => {
    if (!pairMode) return
    event.preventDefault()
    drag = { pair: pairMode }
    setPairHover(pairMode)
    if (iframe) iframe.style.pointerEvents = 'none'
    document.body.style.userSelect = 'none'
    document.body.style.cursor = pairMode === 'xy'
      ? 'move'
      : pairMode === 'x' ? 'col-resize' : 'row-resize'
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onCenterEnter = () => setPairHover(pairMode)
  const onCenterLeave = () => {
    if (!drag?.pair) clearPairHover()
  }

  const bindings = [
    [gutters.colTop, startDrag('top', 'x')],
    [gutters.colBottom, startDrag('bottom', 'x')],
    [gutters.rowLeft, startDrag('left', 'y')],
    [gutters.rowRight, startDrag('right', 'y')]
  ]

  bindings.forEach(([element, handler]) => {
    element.addEventListener('pointerdown', handler)
  })

  if (gutters.center) {
    gutters.center.addEventListener('pointerdown', startPairDrag)
    gutters.center.addEventListener('pointerenter', onCenterEnter)
    gutters.center.addEventListener('pointerleave', onCenterLeave)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag)
  window.addEventListener('pointercancel', stopDrag)

  const observer = new window.ResizeObserver(apply)
  observer.observe(container)
  apply()

  return {
    apply,
    getRatios: () => ({ ...ratios }),
    setRatios: (next) => {
      Object.assign(ratios, next)
      apply()
    },
    destroy () {
      stopDrag()
      observer.disconnect()
      clearPairHover()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
      bindings.forEach(([element, handler]) => {
        element.removeEventListener('pointerdown', handler)
      })
      if (gutters.center) {
        gutters.center.removeEventListener('pointerdown', startPairDrag)
        gutters.center.removeEventListener('pointerenter', onCenterEnter)
        gutters.center.removeEventListener('pointerleave', onCenterLeave)
        gutters.center.hidden = true
      }
    }
  }
}

export function clearMosaicStyles (elements) {
  elements.forEach((element) => {
    if (!element) return
    element.style.position = ''
    element.style.left = ''
    element.style.top = ''
    element.style.width = ''
    element.style.height = ''
    element.style.clipPath = ''
  })
}

export function trackRatio (template) {
  if (!template) return 0.5
  const nums = template
    .trim()
    .split(/\s+/)
    .filter(track => track !== '8px')
    .map(track => parseFloat(track))
    .filter(num => !Number.isNaN(num))

  if (nums.length < 2) return 0.5
  const sum = nums[0] + nums[1]
  return sum ? nums[0] / sum : 0.5
}

export { DEFAULT_RATIOS }
