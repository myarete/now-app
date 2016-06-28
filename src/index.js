import { app, Tray, Menu, MenuItem, dialog, shell } from 'electron'
import path from 'path'
import { sync as isInstalled } from 'hasbin'
import { exec } from 'child_process'
import notify from 'display-notification'

app.dock.hide()
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
      title: 'Successfully installed now!',
      text: 'You can now start using the "now" command in your terminal.',
      sound: 'Pop'
    })

    fillTray(setupMenu())
  })
}

const setupMenu = isInstalling => {
  const menu = new Menu()
  const installed = isInstalled('now')

  menu.append(new MenuItem({
    label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
    role: 'about'
  }))

  menu.append(new MenuItem({
    type: 'separator'
  }))

  if (!installed) {
    menu.append(new MenuItem({
      label: 'Couldn\'t find module',
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

  if (installed) {
    menu.append(new MenuItem({
      label: 'Share Folder...',
      role: 'about'
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
      label: 'Uninstall'
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
