import { app, Tray, Menu, MenuItem } from 'electron'
import path from 'path'
import { sync as isInstalled } from 'hasbin'

app.setName('Now')

app.on('ready', () => {
  const tray = new Tray(path.join(__dirname + '/../assets', 'iconTemplate.png'))
  const menu = new Menu()

  if (!isInstalled('now')) {
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
