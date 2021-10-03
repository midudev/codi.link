import Split from 'split-grid'
import { NORMAL_LAYOUT } from './constants/grid-templates'

let splitInstance

const setSplitLayout = (layout = NORMAL_LAYOUT) => {
  if (splitInstance) {
    splitInstance.destroy(true)
  }

  splitInstance = Split(layout)
}

export default setSplitLayout
