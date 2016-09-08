// Native
import path from 'path'

// Packages
import {remote} from 'electron'
import fs from 'fs-promise'
import tmp from 'tmp-promise'

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

const downloadBinary = async url => {
  let response

  try {
    response = await fetch(url)
  } catch (err) {
    showError('Not able to download binary', err)
    return
  }

  if (!response.ok) {
    showError('Newest binary could not be downloaded')
    return
  }

  let buffer
  let tempDir

  try {
    buffer = await response.buffer()
  } catch (err) {
    showError('Could not create buffer from binary', err)
    return
  }

  try {
    tempDir = await tmp.dir()
  } catch (err) {
    showError('Could not create temporary directory', err)
    return
  }

  const destination = path.join(tempDir.path, 'now')

  try {
    fs.writeFile(destination, buffer)
  } catch (err) {
    showError('Not able to save binary', err)
    return
  }

  return {
    destination,
    cleanup: tempDir.cleanup
  }
}

export default async () => {
  const downloadURL = await getBinaryURL()
  const binaryPath = await downloadBinary(downloadURL)

  console.log(binaryPath)
  console.log('Done!')
}
