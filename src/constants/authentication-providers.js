import authenticateWithGithub from '../services/authentication/github'

export const PROVIDERS = {
  GITHUB: 'GITHUB'
}

export const AUTHENTICATION_PROVIDER = {
  GITHUB: {
    authenticate: authenticateWithGithub
  }
}
