// Native
// import os from 'os'

// Packages
import {remote} from 'electron'
import fs from 'fs-promise'

// Ours
import showError from './error'

const fetch = remote.require('node-fetch')

const getBinaryURL = async () => {
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

  return downloadURL
}

export default async () => {
  const downloadURL = await getBinaryURL()
  let response

  try {
    response = await fetch(downloadURL)
  } catch (err) {
    showError('Not able to download binary', err)
    return
  }

  if (!response.ok) {
    showError('Newest binary could not be downloaded')
    return
  }

  let buffer

  try {
    buffer = await response.buffer()
  } catch (err) {
    showError('Could not create buffer from binary', err)
    return
  }

  try {
    fs.writeFile('/Users/leo/Desktop/binary', buffer)
  } catch (err) {
    showError('Not able to save binary', err)
    return
  }

  console.log('Done!')
}
