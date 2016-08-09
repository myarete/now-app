import path from 'path'
import {sync as isInstalled} from 'hasbin'
import {Tray, Menu} from 'electron'
import {run} from './utils/actions'
import menuItems from './menu'
import {app, showError} from './utils'
import Updater from './updater'

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  const tray = new Tray(path.join(__dirname, '/../assets', 'iconTemplate.png'))
  const installed = isInstalled('now')

  if (installed) {
    const updater = new Updater()
  }

  tray.on('drop-files', (event, files) => {
    if (!isInstalled('now')) {
      return showError('The global package isn\'t installed. You need it for sharing stuff!')
    }

    if (files.length > 1) {
      return showError('It\'s not yet possible to share multiple files/directories at once.')
    }

    for (const file of files) {
      run('ns', file)
    }

    event.preventDefault()
  })

  const menu = Menu.buildFromTemplate(menuItems)

  tray.setToolTip('Realtime node.js deployments')
  tray.setContextMenu(menu)
})
