// Native
import path from 'path'
import {execSync as exec} from 'child_process'

// Packages
import {autoUpdater} from 'electron'
import ms from 'ms'
import exists from 'path-exists'
import compareVersions from 'compare-versions'
import fs from 'fs-promise'

// Ours
import {version} from '../../package'
import {error as showError} from './dialogs'
import notify from './notify'
import * as binaryUtils from './utils/binary'

const platform = process.platform ? 'osx' : process.platform === 'darwin'
const feedURL = 'https://now-auto-updates.now.sh/update/' + platform

const localBinaryVersion = () => {
  const cmd = exec('now -v').toString()
  const parts = cmd.split(' ')

  return parts[2].trim()
}

const updateBinary = async () => {
  const binaryDir = binaryUtils.getPath()
  const fullPath = path.join(binaryDir, 'now')

  if (!await exists(fullPath)) {
    return
  }

  if (process.env.BINARY_UPDATE_RUNNING === 'yes') {
    return
  }

  process.env.BINARY_UPDATE_RUNNING = 'yes'
  console.log('Checking for binary updates...')

  const currentRemote = await binaryUtils.getURL()
  const currentLocal = localBinaryVersion()

  const comparision = compareVersions(currentLocal, currentRemote.version)

  if (comparision !== -1) {
    console.log('No updates found for binary')
    return
  }

  console.log('Found update for binary! Downloading...')

  let updateFile

  try {
    updateFile = await binaryUtils.download(currentRemote.url)
  } catch (err) {
    console.error('Could not download update for binary')
    return
  }

  try {
    await fs.remove(fullPath)
  } catch (err) {
    console.error(err)
    return
  }

  try {
    await fs.rename(updateFile.path, fullPath)
  } catch (err) {
    console.error(err)
    return
  }

  // Make the binary executable
  await binaryUtils.setPermissions(binaryDir)

  updateFile.cleanup()
  process.env.BINARY_UPDATE_RUNNING = 'no'

  notify({
    title: 'Updated the Now Binary to v' + currentRemote.version,
    body: 'Try it in your terminal!'
  })
}

export default () => {
  setInterval(() => {
    if (process.env.CONNECTION === 'offline') {
      return
    }

    updateBinary()
  }, ms('25m'))

  autoUpdater.on('error', (err, msg) => {
    showError('Auto updater failed', msg + ' (' + err.stack + ')')
  })

  try {
    autoUpdater.setFeedURL(feedURL + '/' + version)
  } catch (err) {
    showError('Auto updated could not set feed URL', err)
  }

  const checkForUpdates = () => {
    if (process.env.CONNECTION === 'offline') {
      return
    }

    autoUpdater.checkForUpdates()
  }

  // Check once in the beginning
  setTimeout(checkForUpdates, ms('10s'))

  // And then every 30 minutes
  setInterval(checkForUpdates, ms('30m'))

  autoUpdater.on('update-downloaded', () => {
    process.env.UPDATE_STATUS = 'downloaded'

    notify({
      title: 'Update downloaded',
      body: 'Restart the application to enjoy the changes!'
    })
  })
}
