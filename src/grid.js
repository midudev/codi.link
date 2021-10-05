import Split from 'split-grid'
import { $ } from './utils'
import { getState } from './state'

const splitGrid = Split({
  columnGutters: [{
    track: 1,
    element: $('.vertical-gutter')
  }],
  rowGutters: [{
    track: 1,
    element: $('.horizontal-gutter')
  }]
})

// Metodo de preservasión de grid
const saveGridTemplate = () => {
  const { preserveGrid } = getState()

  if (preserveGrid) {
    const gridStyles = $('.grid').style
    const gridTemplate = JSON.stringify({
      'grid-template-columns': gridStyles['grid-template-columns'],
      'grid-template-rows': gridStyles['grid-template-rows']
    })

    window.localStorage.setItem('gridTemplate', gridTemplate)
  }
}

const setGridTemplate = () => {
  const { preserveGrid } = getState()

  if (!preserveGrid) return window.localStorage.removeItem('gridTemplate')

  const gridTemplate = JSON.parse(window.localStorage.getItem('gridTemplate'))
  if (gridTemplate !== null) {
    const gridStyles = $('.grid').style
    gridStyles['grid-template-rows'] = gridTemplate['grid-template-rows']
    gridStyles['grid-template-columns'] = gridTemplate['grid-template-columns']
  }
}

// Eventos para guardar el estado de la grid una vez que se termine de mover
const { columnGutters, rowGutters } = splitGrid

for (const gutterIndex in columnGutters) {
  const gutter = columnGutters[gutterIndex]
  gutter.onDragEnd = () => {
    saveGridTemplate()
  }
}

for (const gutterIndex in rowGutters) {
  const gutter = rowGutters[gutterIndex]
  gutter.onDragEnd = () => {
    saveGridTemplate()
  }
}

setGridTemplate()
