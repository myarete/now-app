// Packages
import {remote} from 'electron'
import tmp from 'tmp-promise'
import download from 'download'
import retry from 'async-retry'
import fs from 'fs-promise'
import which from 'which-promise'

// Ours
import showError from './error'

// Load from main process
const fetch = remote.require('node-fetch')
const sudo = remote.require('sudo-prompt')
const path = remote.require('path')

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
    await retry(async () => await download(url, tempDir.path))
  } catch (err) {
    showError('Could not download binary', err)
    return
  }

  return {
    path: path.join(tempDir.path, 'now-macos'),
    cleanup: tempDir.cleanup
  }
}

const getPath = () => {
  const path = remote.process.env.PATH.split(':')
  const first = '/usr/local/bin'

  if (path.includes(first)) {
    return first
  }

  return '/usr/bin'
}

const exists = async location => {
  try {
    await fs.stat(location)
  } catch (err) {
    return false
  }

  return true
}

const handleExistingBinary = async () => {
  let existing

  try {
    existing = await which('now')
  } catch (err) {
    return
  }

  const details = path.parse(existing)
  let index = 1

  const newFile = await retry(async () => {
    details.name = details.base = 'now.old.' + index.toString()
    const newFile = path.format(details)

    if (await exists(newFile)) {
      throw new Error('Binary already exists')
    }

    return newFile
  }, {
    onRetry() {
      ++index
    }
  })

  try {
    await fs.rename(existing, newFile)
  } catch (err) {
    showError('Could not rename existing binary', err)
  }
}

export default async () => {
  const downloadURL = await getBinaryURL()
  const location = await downloadBinary(downloadURL)

  const destination = getPath()
  const command = 'mv ' + location.path + ' ' + destination + '/now'

  // If there's an existing binary, rename it
  try {
    await handleExistingBinary()
  } catch (err) {}

  const sudoOptions = {
    name: 'Now'
  }

  sudo.exec(command, sudoOptions, async (error, stdout, stderr) => {
    if (error) {
      showError('Not able to move binary', error)
      return
    }

    // Copy permissions of node binary
    let nodeStats

    try {
      nodeStats = await fs.stat(destination + '/node')
    } catch (err) {
      console.error(err)
    }

    if (nodeStats) {
      await fs.chmod(destination + '/now', nodeStats.mode)
    }

    console.log(stdout)
    console.log(stderr)

    // Let the user know where finished
    console.log('Done!')

    // Remove temporary directory
    location.cleanup()
  })
}
