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

  win.on('hide', () => {
    if (!tray) {
      return
    }

    tray.setHighlightMode('selection')
  })

  return win
}

const loadDeployments = async () => {
  const now = connector()
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

const toggleContextMenu = async tutorial => {
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

  const generatedMenu = await menuItems(app, tray, deploymentList, tutorial)
  const menu = Menu.buildFromTemplate(generatedMenu)

  tray.popUpContextMenu(menu)
}

const isLoggedIn = () => {
  const userProperty = config.has('now.user')
  return userProperty
}

const fileDropped = async (event, files) => {
  const loggedIn = isLoggedIn()

  if (!loggedIn) {
    return
  }

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

app.on('ready', async () => {
  if (!isDev && process.platform !== 'linux') {
    autoUpdater()
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

  if (isLoggedIn()) {
    await loadDeployments()

    // Regularly rebuild local cache every 10 seconds
    setInterval(() => refreshCache(null, app), ms('10s'))
  }

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

  if (!isLoggedIn()) {
    tray.setHighlightMode('never')

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
  }

  let submenuShown = false
  tray.on('drop-files', fileDropped)

  tray.on('click', async () => {
    const loggedIn = isLoggedIn()

    if (loggedIn) {
      toggleContextMenu(tutorial)
    } else {
      toggleTutorial()
    }
  })

  tray.on('right-click', async event => {
    if (isLoggedIn()) {
      return
    }

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
})
