// Packages
import {autoUpdater} from 'electron'
import ms from 'ms'
import notify from 'display-notification'

const platform = process.platform ? 'osx' : process.platform === 'darwin'
const feedURL = 'https://now-updates.now.sh/update/' + platform

export default app => {
  autoUpdater.on('error', (err, msg) => {
    console.error('Error fetching updates', msg + ' (' + err.stack + ')')
  })

  autoUpdater.setFeedURL(feedURL + '/' + app.getVersion())

  setTimeout(autoUpdater.checkForUpdates, ms('10s'))
  setInterval(autoUpdater.checkForUpdates, ms('5m'))

  autoUpdater.on('update-downloaded', () => {
    notify({
      title: 'Update downloaded',
      text: 'Sheesh'
    })
  })
}
