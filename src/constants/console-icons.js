export const CONSOLE_BADGES = {
  'log:log': { label: 'LOG', color: '#9cdcfe' },
  'log:info': { label: 'INFO', color: '#4fc3f7' },
  'log:warn': { label: 'WARN', color: '#ffa726' },
  'log:error': { label: 'ERROR', color: '#ef5350' },
  'log:debug': { label: 'DEBUG', color: '#ab47bc' },
  'log:table': { label: 'TABLE', color: '#66bb6a' },
  'log:count': { label: 'COUNT', color: '#26c6da' },
  'log:trace': { label: 'TRACE', color: '#8d6e63' },
  'log:dir': { label: 'DIR', color: '#78909c' },
  'log:dirxml': { label: 'DIRXML', color: '#78909c' },
  'log:time': { label: 'TIME', color: '#ffd54f' },
  'log:assert': { label: 'ASSERT', color: '#ff7043' },
  error: null
}

export const createConsoleBadge = (type) => {
  const badge = CONSOLE_BADGES[type]
  if (!badge) return ''
  return `<span class="console-badge" style="background-color: ${badge.color}">${badge.label}</span>`
}
