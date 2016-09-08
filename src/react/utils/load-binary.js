// Native
import path from 'path'

// Packages
import {remote} from 'electron'
import tmp from 'tmp-promise'
import download from 'download'

// Ours
import showError from './error'

// Load from main process
const fetch = remote.require('node-fetch')
const Sudoer = remote.require('electron-sudo').default
const alterPath = remote.require('manage-path')

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
  let tempDir

  try {
    tempDir = await tmp.dir()
  } catch (err) {
    showError('Could not create temporary directory', err)
    return
  }

  try {
    await download(url, tempDir.path)
  } catch (err) {
    showError('Could not download binary', err)
    return
  }

  return {
    path: path.join(tempDir.path, 'now'),
    cleanup: tempDir.cleanup
  }
}

export default async () => {
  const downloadURL = await getBinaryURL()
  const location = await downloadBinary(downloadURL)

  const sudoer = new Sudoer({
    name: 'Now'
  })

  const destination = '/usr/local/bin/now'

  // Move the binary to the user's binary directory
  const mv = await sudoer.spawn('mv', [location.path, destination])

  mv.on('close', () => {
    // Add binary to PATH
    alterPath.push(destination)

    // Let the user know where finished
    console.log('Done!')

    // Remove temporary directory
    location.cleanup()
  })
}
