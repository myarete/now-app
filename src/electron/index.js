// Packages
import {app, Tray, Menu, BrowserWindow} from 'electron'
import ms from 'ms'
import Config from 'electron-config'
import isDev from 'electron-is-dev'
import {dir as isDirectory} from 'path-type'

// Ours
import {resolve as resolvePath} from 'app-root-path'
import {menuItems, deploymentOptions} from './menu'
import {error as showError} from './dialogs'
import deploy from './actions/deploy'
import share from './actions/share'
import autoUpdater from './updates'
import {connector, refreshCache} from './api'

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null
let loggedIn = false

// Hide dock icon and set app name
app.dock.hide()
app.setName('Now')

const config = new Config()

const onboarding = () => {
  const win = new BrowserWindow({
    width: 650,
    height: 430,
    title: 'Welcome to now',
    resizable: false,
    center: true,
    frame: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    backgroundColor: '#000'
  })

  win.loadURL('file://' + resolvePath('../app/pages/welcome.html'))
  return win
}

const fileDropped = async (event, files) => {
  if (files.length > 1) {
    showError('It\'s not yet possible to share multiple files/directories at once.')
    return
  }

  if (isDirectory(files[0])) {
    await deploy(files[0])
  } else {
    await share(files[0])
  }

  event.preventDefault()
}

const loadDeployments = async user => {
  const now = connector(user.token)
  let list

  try {
    list = await now.getDeployments()
  } catch (err) {
    console.error(err)
    return false
  }

  // Save deployments to cache
  config.set('now.cache.deployments', list)
  return true
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', async () => {
  let user

  // Automatically check for updates regularly
  if (!isDev && process.platform !== 'linux') {
    autoUpdater()
  }

  // Check if now's configuration file exists
  if (config.has('now.user')) {
    user = config.get('now.user')

    // If yes, get the token and see if it's valid
    if (user.token && await loadDeployments(user.token)) {
      loggedIn = true
    }
  }

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do

  // I have no idea why, but path.resolve doesn't work here
  try {
    tray = new Tray(resolvePath('/assets/icons/iconTemplate.png'))
  } catch (err) {
    showError(err)
    return
  }

  if (loggedIn) {
    tray.on('drop-files', fileDropped)

    // Regularly rebuild local cache every 10 seconds
    setInterval(() => refreshCache(null, app), ms('10s'))

    tray.on('click', async () => {
      const deployments = config.get('now.cache.deployments')
      const aliases = config.get('now.cache.aliases')

      const deploymentList = []

      for (const deployment of deployments) {
        const info = deployment
        const index = deployments.indexOf(deployment)

        if (aliases) {
          const aliasInfo = aliases.find(a => deployment.uid === a.deploymentId)

          if (aliasInfo) {
            info.url = aliasInfo.alias
          }
        }

        deploymentList[index] = deploymentOptions(info)
      }

      const generatedMenu = await menuItems(app, tray, config, deploymentList)
      const menu = Menu.buildFromTemplate(generatedMenu)

      tray.popUpContextMenu(menu)
    })
  } else {
    tray.setHighlightMode('never')
    let isHighlighted = false

    const toggleHighlight = () => {
      tray.setHighlightMode(isHighlighted ? 'never' : 'always')
      isHighlighted = !isHighlighted
    }

    const tutorial = onboarding()

    const toggleTutorial = event => {
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
    }

    const events = [
      'closed',
      'minimize',
      'restore'
    ]

    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    tutorial.on('ready-to-show', toggleTutorial)

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

    tray.on('click', toggleTutorial)
    let submenuShown = false

    // Ability to close the app when logged out
    tray.on('right-click', async event => {
      const menu = Menu.buildFromTemplate([
        {
          label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
          click: app.quit,
          role: 'quit'
        }
      ])

      // Toggle highlight mode if tutorial isn't visible
      if (!tutorial.isVisible()) {
        toggleHighlight()
      }

      // Toggle submenu
      tray.popUpContextMenu(submenuShown ? null : menu)
      submenuShown = !submenuShown

      event.preventDefault()
    })
  }
})
