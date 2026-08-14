export const DEMOS = [
  {
    id: 'counter',
    titleKey: 'demoCounter',
    descriptionKey: 'demoCounterDesc',
    load: () => import('./counter.js')
  },
  {
    id: 'clock',
    titleKey: 'demoClock',
    descriptionKey: 'demoClockDesc',
    load: () => import('./clock.js')
  },
  {
    id: 'todo',
    titleKey: 'demoTodo',
    descriptionKey: 'demoTodoDesc',
    load: () => import('./todo.js')
  },
  {
    id: 'orbs',
    titleKey: 'demoOrbs',
    descriptionKey: 'demoOrbsDesc',
    load: () => import('./orbs.js')
  },
  {
    id: 'theme-toggle',
    titleKey: 'demoThemeToggle',
    descriptionKey: 'demoThemeToggleDesc',
    load: () => import('./theme-toggle.js')
  },
  {
    id: 'typewriter',
    titleKey: 'demoTypewriter',
    descriptionKey: 'demoTypewriterDesc',
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
