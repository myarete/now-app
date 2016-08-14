// Native
import path from 'path'

// Packages
import userHome from 'user-home'
import {app, Tray, Menu, BrowserWindow} from 'electron'
import pathExists from 'path-exists'
import Now from 'now-api'

// Ours
import menuItems from './menu'
import {error as showError} from './dialogs'
import {share} from './actions'

// Get path of config file
const configFile = path.join(userHome, '.now.json')
let loggedIn = false

// Hide dock icon and set app name
app.dock.hide()
app.setName('Now')

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

const fileDropped = async (event, files) => {
  if (files.length > 1) {
    return showError('It\'s not yet possible to share multiple files/directories at once.')
  }

  share(files[0])
  event.preventDefault()
}

const testConnection = async user => {
  const now = new Now(user.token)

  try {
    await now.getDeployments()
  } catch (err) {
    return false
  }

  process.env.USER_TOKEN = user.token
  process.env.USER_EMAIL = user.email

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
    if (user.token && await testConnection(user)) {
      loggedIn = true
    }
  }

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do
  const tray = new Tray(path.join(__dirname, '/../icons', 'iconTemplate.png'))

  if (loggedIn) {
    tray.on('drop-files', fileDropped)

    const generatedMenu = await menuItems(app)
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
