import { getAuth, signOut } from 'firebase/auth'
import { AUTHENTICATION_PROVIDER } from '../../constants/authentication-providers'

export const authenticate = (provider) => AUTHENTICATION_PROVIDER[provider].authenticate()

export const disconnect = () => {
  const auth = getAuth()
  return signOut(auth)
}
