const electron = require('electron')
const path = require('path')

const app = electron.app
const Tray = electron.Tray
const Menu = electron.Menu
const MenuItem = electron.MenuItem

app.setName('Now')

app.on('ready', () => {
  const tray = new Tray(path.join(__dirname, 'tray-icon.png'))
  const menu = new Menu()

  menu.append(new MenuItem({
    label: 'Haha',
    type: 'radio',
    checked: true
  }))

  menu.append(new MenuItem({
    type: 'separator'
  }))

  menu.append(new MenuItem({
    label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
    click: app.quit
  }))

  tray.setToolTip('This is my application.')
  tray.setContextMenu(menu)
})
