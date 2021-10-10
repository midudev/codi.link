import { getDatabase, ref, set, get, child } from 'firebase/database'
import shortId from 'shortid'

export const saveCodeState = async ({ code, currentId }) => {
  const db = getDatabase()

  const generateId = shortId.generate()

  const id = currentId && await isValidId(currentId) ? currentId : generateId

  try {
    await set(ref(db, 'codes/' + id), {
      code
    })

    return { id }
  } catch (error) { }
}

const isValidId = async (id) => {
  const dbRef = ref(getDatabase())
  const snapshot = await get(child(dbRef, `codes/${id}`))
  return snapshot.exists()
}

export const getCodeState = async ({ id }) => {
  const dbRef = ref(getDatabase())

  try {
    const snapshot = await get(child(dbRef, `codes/${id}`))
    return snapshot.exists() ? snapshot.val() : {}
  } catch (error) {
    return { }
  }
}
