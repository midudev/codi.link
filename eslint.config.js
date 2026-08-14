import neostandard from 'neostandard'

export default [
  { ignores: ['src-tauri/target/**'] },
  ...neostandard({
    noStyle: true
  })
]
