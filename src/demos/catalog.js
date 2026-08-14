export const DEMOS = [
  {
    id: 'counter',
    titleKey: 'demoCounter',
    descriptionKey: 'demoCounterDesc',
    tags: ['HTML', 'CSS', 'JS'],
    load: () => import('./counter.js')
  },
  {
    id: 'clock',
    titleKey: 'demoClock',
    descriptionKey: 'demoClockDesc',
    tags: ['HTML', 'CSS', 'JS'],
    load: () => import('./clock.js')
  },
  {
    id: 'todo',
    titleKey: 'demoTodo',
    descriptionKey: 'demoTodoDesc',
    tags: ['HTML', 'CSS', 'JS'],
    load: () => import('./todo.js')
  },
  {
    id: 'orbs',
    titleKey: 'demoOrbs',
    descriptionKey: 'demoOrbsDesc',
    tags: ['HTML', 'CSS', 'JS'],
    load: () => import('./orbs.js')
  },
  {
    id: 'theme-toggle',
    titleKey: 'demoThemeToggle',
    descriptionKey: 'demoThemeToggleDesc',
    tags: ['HTML', 'CSS', 'JS'],
    load: () => import('./theme-toggle.js')
  },
  {
    id: 'typewriter',
    titleKey: 'demoTypewriter',
    descriptionKey: 'demoTypewriterDesc',
    tags: ['HTML', 'CSS', 'JS'],
    load: () => import('./typewriter.js')
  }
]

const demoById = new Map(DEMOS.map(demo => [demo.id, demo]))

export async function loadDemo (id) {
  const demo = demoById.get(id)

  if (!demo) {
    throw new Error(`Unknown demo: ${id}`)
  }

  const { default: code } = await demo.load()
  return code
}
