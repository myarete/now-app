import path from 'path'
import { sync as isInstalled } from 'hasbin'
import { exec, spawn } from 'child_process'
import notify from 'display-notification'
import { share, deploy } from './utils/actions'

import {
  app,
  Tray,
  Menu,
  MenuItem,
  dialog,
  shell,
  BrowserWindow
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

    fillTray(setupMenu())
  })
}

const setupMenu = isInstalling => {
  const menu = new Menu()
  const installed = isInstalled('now')

  if (installed) {
    menu.append(new MenuItem({
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      role: 'about'
    }))

    menu.append(new MenuItem({
      type: 'separator'
    }))
  } else {
    menu.append(new MenuItem({
      label: 'Get Started...',
      click: () => onboarding.show()
    }))
  }

  menu.append(new MenuItem({
    type: 'separator'
  }))

  if (installed) {
    menu.append(new MenuItem({
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      click: share
    }))

    menu.append(new MenuItem({
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      click: deploy
    }))

    menu.append(new MenuItem({
      type: 'separator'
    }))

    menu.append(new MenuItem({
      label: 'Documentation...',
      click () {
        shell.openExternal('https://zeit.co/now')
      }
    }))

    menu.append(new MenuItem({
      label: 'Tutorial...',
      click: () => onboarding.show()
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

const onboardingSpecs = {
  width: 800,
  height: 600,
  show: false,
  title: 'Getting started with Zeit',
  resizable: false,
  center: true
}

const initializeWelcome = () => {
  onboarding = new BrowserWindow(onboardingSpecs)
  onboarding.loadURL(`file://${__dirname}/../pages/welcome.html`)
}

app.on('ready', () => {
  tray = new Tray(path.join(__dirname + '/../assets', 'iconTemplate.png'))
  initializeWelcome()

  app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
      app.quit()
    }

    initializeWelcome()
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

  fillTray(setupMenu())
})
