// Packages
import {autoUpdater} from 'electron'
import ms from 'ms'
import notify from 'display-notification'

// Ours
import {version} from '../../package'
import {error as showError} from './dialogs'

const platform = process.platform ? 'osx' : process.platform === 'darwin'
const feedURL = 'https://now-updates.now.sh/update/' + platform

export default () => {
  autoUpdater.on('error', showError)

  try {
    autoUpdater.setFeedURL(feedURL + '/' + version)
  } catch (err) {
    console.error(err)
  }

  setTimeout(autoUpdater.checkForUpdates, ms('10s'))
  setInterval(autoUpdater.checkForUpdates, ms('5m'))

  autoUpdater.on('update-downloaded', () => notify({
    title: 'Update downloaded',
    text: 'Sheesh'
  }))
}
