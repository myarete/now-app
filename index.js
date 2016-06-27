const electron = require('electron')
const path = require('path')
const hasbin = require('hasbin')

const app = electron.app
const Tray = electron.Tray
const Menu = electron.Menu
const MenuItem = electron.MenuItem

app.setName('Now')

app.on('ready', () => {
  const tray = new Tray(path.join(__dirname, 'iconTemplate.png'))
  const menu = new Menu()

  if (!hasbin.sync('now')) {
    menu.append(new MenuItem({
      label: 'Global module not installed',
      enabled: false
    }))

    menu.append(new MenuItem({
      label: 'Install'
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

  tray.setToolTip('This is my application.')
  tray.setContextMenu(menu)
})
