import { getAuth, GithubAuthProvider, signInWithPopup } from 'firebase/auth'

const authenticateWithGithub = async () => {
  const auth = getAuth()
  const provider = new GithubAuthProvider()

  try {
    const result = await signInWithPopup(auth, provider)

    const credential = GithubAuthProvider.credentialFromResult(result)
    const token = credential.accessToken

    const user = result.user
    return { data: { token, user } }
  } catch (error) {
    const errorCode = error.code
    const errorMessage = error.message
    const email = error.email
    const credential = GithubAuthProvider.credentialFromError(error)

    const response = {
      code: errorCode,
      message: errorMessage,
      email,
      credential
    }
    return { error: response }
  }
}

export default authenticateWithGithub
