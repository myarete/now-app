// Packages
import {shell, autoUpdater, clipboard, dialog, BrowserWindow} from 'electron'
import moment from 'moment'
import {resolve as resolvePath} from 'app-root-path'
import Config from 'electron-config'

// Ours
import {deploy, share, error} from './dialogs'
import logout from './actions/logout'
import {connector, refreshCache} from './api'
import notify from './notify'

// Determine if an update is ready to be installed
// Based on an environment variable
const updateAvailable = process.env.UPDATE_AVAILABLE || false

const about = () => {
  const win = new BrowserWindow({
    width: 360,
    height: 425,
    title: 'About',
    resizable: false,
    center: true,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    titleBarStyle: 'hidden-inset',
    frame: false,
    backgroundColor: '#ECECEC'
  })

  win.loadURL('file://' + resolvePath('../app/pages/about.html'))
  return win
}

export function deploymentOptions(info) {
  const created = moment(new Date(parseInt(info.created, 10)))
  const url = 'https://' + info.url

  return {
    label: info.name,
    submenu: [
      {
        label: 'Open in Browser...',
        click: () => shell.openExternal(url)
      },
      {
        label: 'Copy URL to Clipboard',
        click() {
          clipboard.writeText(url)

          // Let the user know
          notify({
            title: 'Copied to clipboard',
            body: 'Your clipboard now contains the URL of your deployment.'
          })
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Delete...',
        click: async () => {
          // Ask the user if it was an accident
          const keepIt = dialog.showMessageBox({
            type: 'question',
            title: 'Removal of ' + info.name,
            message: 'Do you really want to delete this deployment?',
            detail: info.name,
            buttons: [
              'Yes',
              'Cancel'
            ]
          })

          // If so, do nothing
          if (keepIt) {
            return
          }

          notify({
            title: `Deleting ${info.name}...`,
            body: 'The deployment is being deleted from our infrastructure. We\'ll let you know once it\'s gone!'
          })

          // Otherwise, delete the deployment
          const now = connector()

          try {
            await now.deleteDeployment(info.uid)
          } catch (err) {
            console.error(err)
            error('Wasn\'t not able to remove deployment ' + info.name)

            return
          }

          notify({
            title: 'Deleted ' + info.name,
            body: 'The deployment has successfully been deleted.'
          })

          try {
            await refreshCache('deployments')
          } catch (err) {
            return error(err)
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Created on ' + created.format('MMMM Do YYYY') + ', ' + created.format('h:mm a'),
        enabled: false
      }
    ]
  }
}

export async function menuItems(app, tray, deployments, tutorial) {
  let hasDeployments = false

  if (Array.isArray(deployments) && deployments.length > 0) {
    hasDeployments = true
  }

  const aboutWindow = about()
  const config = new Config()

  return [
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click: () => aboutWindow.show()
    },
    {
      type: 'separator'
    },
    {
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      click: async () => await share(tray)
    },
    {
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      click: async () => await deploy(tray)
    },
    {
      type: 'separator'
    },
    {
      label: 'Deployments',

      // We need this because electron otherwise keeps the item alive
      // Even if the submenu is just an empty array
      type: hasDeployments ? 'submenu' : 'normal',

      submenu: hasDeployments ? deployments : [],
      visible: hasDeployments
    },
    {
      type: 'separator'
    },
    {
      label: 'Account',
      submenu: [
        {
          label: config.get('now.user.email') || 'No user defined',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout',
          click: async () => await logout(app, tutorial)
        }
      ]
    },
    {
      label: 'Documentation...',
      click: () => shell.openExternal('https://zeit.co/now')
    },
    {
      type: 'separator'
    },
    {
      label: 'Update available',
      enabled: false,
      visible: updateAvailable
    },
    {
      label: 'Install',
      click: () => autoUpdater.quitAndInstall(),
      visible: updateAvailable
    },
    {
      type: 'separator'
    },
    {
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      click: app.quit,
      role: 'quit'
    }
  ]
}
