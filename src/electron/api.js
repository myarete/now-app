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

const refreshKind = async (name, session) => {
  let method

  switch (name) {
    case 'deployments':
      method = 'getDeployments'
      break
    default:
      method = false
  }

  if (!method) {
    console.error(`Not able to refresh ${name} cache`)
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
  const configProperty = 'now.cache.' + name

  config.set(configProperty, freshData)
}

export async function refreshCache(kind) {
  const session = connector()

  if (kind) {
    try {
      await refreshKind(kind, session)
    } catch (err) {
      showError(err)
    }

    return
  }

  const sweepers = []

  const kinds = [
    'deployments'
  ]

  for (const kind of kinds) {
    const refresher = refreshKind(kind, session)
    sweepers.push(refresher)
  }

  try {
    await Promise.all(sweepers)
  } catch (err) {
    showError(err)
    return
  }

  console.log('Refreshed entire cache')
}
