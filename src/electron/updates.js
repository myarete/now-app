// Packages
import {autoUpdater} from 'electron'
import ms from 'ms'
import notify from 'display-notification'

// Ours
import {error as showError} from './dialogs'

// const platform = process.platform ? 'osx' : process.platform === 'darwin'
// const feedURL = 'https://hyperterm-updates.now.sh/update/' + platform

export default () => {
  autoUpdater.on('error', showError)

  // autoUpdater.setFeedURL(feedURL + '/' + app.getVersion())

  setTimeout(autoUpdater.checkForUpdates, ms('10s'))
  setInterval(autoUpdater.checkForUpdates, ms('5m'))

  autoUpdater.on('update-downloaded', () => notify({
    title: 'Update downloaded',
    text: 'Sheesh'
  }))
}
