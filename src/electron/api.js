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

export async function refreshCache(kind) {
  const session = connector()
  let method

  switch (kind) {
    case 'deployments':
      method = 'getDeployments'
      break
    default:
      method = false
  }

  if (!method) {
    console.error(`Not able to refresh ${kind} cache`)
    return
  }

  let freshData

  try {
    freshData = await session[method]()
  } catch (err) {
    showError(err)
    return
  }

  const config = new Config()
  const configProperty = 'now.cache.' + kind

  config.set(configProperty, freshData)
}
