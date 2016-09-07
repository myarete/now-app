// Packages
import {remote} from 'electron'

// Ours
import showError from './error'

export default async () => {
  const fetch = remote.require('node-fetch')
  const url = 'https://api.github.com/repos/zeit/now-binaries/releases/latest'

  let response

  try {
    response = await fetch(url)
  } catch (err) {
    showError('Not able to load latest binary release', err)
    return
  }

  if (!response.ok) {
    showError('Latest binary release could not be loaded')
    return
  }

  try {
    response = await response.json()
  } catch (err) {
    showError('Could not parse response as JSON', err)
    return
  }

  const downloadURL = response.assets[0].browser_download_url

  if (!downloadURL) {
    showError('Latest release doesn\'t contain a binary')
    return
  }

  console.log(downloadURL)
}
