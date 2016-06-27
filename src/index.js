import { app, Tray, Menu, MenuItem, dialog } from 'electron'
import path from 'path'
import { sync as isInstalled } from 'hasbin'
import { exec } from 'child_process'
import notify from 'display-notification'

app.setName('Now')

let tray

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
    title: 'Installing now...',
    text: 'We\'ll notify you when it\'s ready to be used!',
    sound: 'Pop'
  })

  exec('npm install -g now', (err, stdout, stderr) => {
    if (err) {
      showError(err)
      return
    }

    notify({
      title: 'Installing now successfully!',
      text: 'You can now start using the "now" command in your terminal.',
      sound: 'Pop'
    })

    fillTray(setupMenu())
  })
}

const setupMenu = isInstalling => {
  const menu = new Menu()

  if (!isInstalled('now')) {
    menu.append(new MenuItem({
      label: 'Global module not installed',
      enabled: false
    }))

    menu.append(new MenuItem({
      label: isInstalling ? 'Installing...' : 'Install',
      enabled: isInstalling ? false : true,
      click: installNow
    }))
  }

  menu.append(new MenuItem({
    type: 'separator'
  }))

  menu.append(new MenuItem({
    label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
    click: app.quit,
    role: 'quit'
  }))

  return menu
}

const fillTray = menu => {
  tray.setToolTip('Realtime node.js deployments')
  tray.setContextMenu(menu)
}

app.on('ready', () => {
  tray = new Tray(path.join(__dirname + '/../assets', 'iconTemplate.png'))
  const menu = setupMenu()

  fillTray(menu)
})
