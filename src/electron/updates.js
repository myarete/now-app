// Packages
import {autoUpdater} from 'electron'
import ms from 'ms'

// Ours
import {version} from '../../package'
import {error as showError} from './dialogs'
import notify from './notify'

const platform = process.platform ? 'osx' : process.platform === 'darwin'
const feedURL = 'https://now-auto-updates.now.sh/update/' + platform

const updateBinary = async () => {
  console.log('Checking for binary updates...')
}

export default () => {
  setInterval(updateBinary, ms('10s'))

  autoUpdater.on('error', err => console.error(err))

  try {
    autoUpdater.setFeedURL(feedURL + '/' + version)
  } catch (err) {
    showError('Auto updated could not set feed URL', err)
  }

  setInterval(autoUpdater.checkForUpdates, ms('30m'))

  autoUpdater.on('update-downloaded', () => notify({
    title: 'Update downloaded',
    body: 'Restart the application to enjoy the changes!'
  }))
}
