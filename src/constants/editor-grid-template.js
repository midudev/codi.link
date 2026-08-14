export const EDITOR_GRID_TEMPLATE = {
  default: 'grid-template-columns: 1fr; grid-template-rows: 1fr 8px 1fr',
  'layout-2': 'grid-template-columns: 1fr; grid-template-rows: 1fr 8px 1fr',
  vertical: 'grid-template-columns: 1fr 8px 1fr 8px 1fr 8px 1fr; grid-template-rows: 1fr',
  horizontal: 'grid-template-columns: 1fr; grid-template-rows: 1fr 8px 1fr 8px 1fr 8px 1fr',
  bottom: 'grid-template-columns: 1fr 8px 1fr 8px 1fr; grid-template-rows: 1fr 8px 1fr',
  tabs: 'grid-template-columns: 5fr 8px 3fr; grid-template-rows: 40px 1fr',
  'tabs-mobile': 'grid-template-columns: 1fr; grid-template-rows: 40px minmax(0, 1fr)'
}

export const DEFAULT_GRID_TEMPLATE = EDITOR_GRID_TEMPLATE.default
