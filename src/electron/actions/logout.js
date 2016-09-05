// Packages
import Config from 'electron-config'
import fetch from 'node-fetch'

// Ours
import {error as showError} from '../dialogs'

const endpoint = 'https://zeit.co/api/www/user/tokens/'

const requestHeaders = token => {
  return {
    headers: {
      Authorization: `bearer ${token}`
    }
  }
}

const getTokenId = async token => {
  let result

  try {
    result = await fetch(endpoint, requestHeaders(token))
  } catch (err) {
    showError(err)
    return
  }

  const tokenList = await result.json()

  if (!tokenList.tokens) {
    return
  }

  const tokenInfo = tokenList.tokens.find(t => token === t.token)

  if (!tokenInfo) {
    return
  }

  return tokenInfo.id
}

const revokeToken = async (token, tokenId) => {
  const details = {
    method: 'DELETE'
  }

  Object.assign(details, requestHeaders(token))

  let result

  try {
    result = await fetch(endpoint + encodeURIComponent(tokenId), details)
  } catch (err) {
    showError(err)
    return
  }

  if (!result.ok) {
    console.error('Not able to log out')
  }
}

export default async (app, tutorial) => {
  const config = new Config()

  // Cache user information
  const userDetails = config.get('now.user')

  // Remove configuration information
  config.delete('now.user')
  const existent = config.has('now.user')

  if (existent) {
    showError('Couldn\'t log out')
  }

  // Prepare the tutorial by reloading its contents
  tutorial.reload()

  // Once the content has loaded again, show it
  tutorial.once('ready-to-show', () => tutorial.show())

  let tokenId

  try {
    tokenId = await getTokenId(userDetails.token)
  } catch (err) {
    showError(err)
    return
  }

  try {
    await revokeToken(userDetails.token, tokenId)
  } catch (err) {
    showError(err)
    return
  }
}
