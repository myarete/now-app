// Packages
import Now from 'now-api'

// Ours
import {error as showError} from './dialogs'

export default () => {
  const token = process.env.USER_TOKEN

  if (!token) {
    showError('No token defined. Not able to load data!')
    return false
  }

  return new Now(token)
}
