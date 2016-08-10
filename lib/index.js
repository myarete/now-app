import path from 'path'
import userHome from 'user-home'
import {Tray, Menu, BrowserWindow} from 'electron'
import pathExists from 'path-exists'
import Now from 'now-api'
import {run} from './utils/actions'
import menuItems from './menu'
import {app, showError} from './utils'

const configFile = path.join(userHome, '.now.json')
let loggedIn = false

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

const testConnection = async token => {
  const now = new Now(token)

  try {
    await now.getDeployments()
  } catch (err) {
    return false
  }

  return true
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', async () => {
  let user

  // Check if now's configuration file exists
  if (await pathExists(configFile)) {
    user = require(configFile)

    // If yes, get the token and see if it's valid
    if (user.token && await testConnection(user.token)) {
      loggedIn = true
    }
  }

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do
  const tray = new Tray(path.join(__dirname, '/../assets', 'iconTemplate.png'))

  if (loggedIn) {
    tray.on('drop-files', fileDropped)

    const generatedMenu = menuItems({
      email: user.email
    })

    const menu = Menu.buildFromTemplate(generatedMenu)
    tray.setContextMenu(menu)
  } else {
    tray.setHighlightMode('never')
    let isHighlighted = false

    const toggleHighlight = () => {
      tray.setHighlightMode(isHighlighted ? 'never' : 'always')
      isHighlighted = !isHighlighted
    }

    const tutorial = onboarding()

    const events = [
      'closed',
      'minimize',
      'restore'
    ]

    // Hide window instead of closing it
    tutorial.on('close', event => {
      if (tutorial.forceClose) {
        return
      }

      toggleHighlight()
      tutorial.hide()

      event.preventDefault()
    })

    // Register window event listeners
    for (const event of events) {
      tutorial.on(event, toggleHighlight)
    }

    // When quitting the app, force close the tutorial
    app.on('before-quit', () => {
      tutorial.forceClose = true
    })

    tray.on('click', event => {
      // If window open and not focused, bring it to focus
      if (tutorial.isVisible() && !tutorial.isFocused()) {
        tutorial.focus()
        return
      }

      // Show or hide onboarding window
      if (isHighlighted) {
        tutorial.hide()
      } else {
        tutorial.show()
        isHighlighted = false
      }

      // Toggle highlight mode
      toggleHighlight()

      // Don't open the menu
      event.preventDefault()
    })
  }
})
