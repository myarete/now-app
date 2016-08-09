import path from 'path'
// import {sync as isInstalled} from 'hasbin'
import {Tray, Menu, BrowserWindow} from 'electron'
import {run} from './utils/actions'
import menuItems from './menu'
import {app, showError} from './utils'

const onboarding = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    title: 'Welcome to now',
    resizable: false,
    center: true,
    frame: false,
    show: false,
    titleBarStyle: 'hidden-inset'
  })

  win.loadURL(`file://${__dirname}/../pages/welcome.html`)
  return win
}

const fileDropped = (event, files) => {
  if (files.length > 1) {
    return showError('It\'s not yet possible to share multiple files/directories at once.')
  }

  for (const file of files) {
    run('ns', file)
  }

  event.preventDefault()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  const tray = new Tray(path.join(__dirname, '/../assets', 'iconTemplate.png'))
  const installed = false // isInstalled('now')

  tray.setHighlightMode('never')
  let isHighlighted = false

  if (installed) {
    tray.on('drop-files', fileDropped)

    const menu = Menu.buildFromTemplate(menuItems)

    tray.setToolTip('Realtime node.js deployments')
    tray.setContextMenu(menu)
  } else {
    const tutorial = onboarding()

    tray.on('click', event => {
      // Show or hide onboarding window
      if (isHighlighted) {
        tutorial.hide()
      } else {
        tutorial.show()
      }

      // Toggle highlight mode
      tray.setHighlightMode(isHighlighted ? 'never' : 'always')
      isHighlighted = !isHighlighted

      event.preventDefault()
    })
  }
})
