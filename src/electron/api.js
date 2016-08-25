// Packages
import Now from 'now-api'
import Config from 'electron-config'

// Ours
import {error as showError} from './dialogs'

export function connector(userToken) {
  const config = new Config()
  const token = userToken || config.get('now.user.token')

  if (!token) {
    showError('No token defined. Not able to load data!')
    return false
  }

  return new Now(token)
}

export function refreshCache(kind) {
  console.log(kind)
}
