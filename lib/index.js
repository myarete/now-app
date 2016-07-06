import path from 'path'
import { sync as isInstalled } from 'hasbin'
import { exec, spawn } from 'child_process'
import notify from 'display-notification'
import { share, deploy } from './utils/actions'
import innerMenu from './menus/installed'
import outerMenu from './menus/outer'

import {
  app,
  Tray,
  Menu,
  dialog
} from 'electron'

app.dock.hide()
app.setName('Now')

let tray,
    onboarding

const showError = detail => dialog.showMessageBox({
  type: 'error',
  message: 'An error occured',
  detail,
  buttons: [
    'Got it'
  ]
})

const installNow = () => {
  fillTray(setupMenu(true))

  notify({
    title: 'Installing module...',
    text: 'We\'ll notify you when it\'s ready to be used!',
    sound: 'Pop'
  })

  exec('npm install -g now', (err, stdout, stderr) => {
    if (err) {
      showError(String(err))
      return
    }

    notify({
      title: 'Successfully installed module!',
      text: 'You now have access to various actions within the "now" application.',
      sound: 'Pop'
    })
  })
}

app.on('ready', () => {
  tray = new Tray(path.join(__dirname + '/../assets', 'iconTemplate.png'))

  app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
      app.quit()
    }
  })

  tray.on('drop-files', (event, files) => {
    if (!isInstalled('now')) {
      return showError('The global package isn\'t installed. You need it for sharing stuff!')
    }

    if (files.length > 1) {
      return showError('It\'s not yet possible to share multiple files/directories at once.')
    }

    for (let file of files) {
      share(file)
    }

    event.preventDefault()
  })

  const installed = isInstalled('now')
  const menu = Menu.buildFromTemplate(installed ? innerMenu : outerMenu)

  tray.setToolTip('Realtime node.js deployments')
  tray.setContextMenu(menu)
})
