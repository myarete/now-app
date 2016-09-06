// Packages
import {autoUpdater} from 'electron'
import ms from 'ms'

// Ours
import {version} from '../../package'
import {error as showError} from './dialogs'
import notify from './notify'

const platform = process.platform ? 'osx' : process.platform === 'darwin'
const feedURL = 'https://now-updates.now.sh/update/' + platform

export default () => {
  autoUpdater.on('error', err => {
    showError('A problem with the auto updater appeared', err)
  })

  try {
    autoUpdater.setFeedURL(feedURL + '/' + version)
  } catch (err) {
    showError('Auto updated could not set feed URL', err)
  }

  setTimeout(autoUpdater.checkForUpdates, ms('10s'))
  setInterval(autoUpdater.checkForUpdates, ms('5m'))

  autoUpdater.on('update-downloaded', () => notify({
    title: 'Update downloaded',
    body: 'Restart the application to enjoy the changes!'
  }))
}
