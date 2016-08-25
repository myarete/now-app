// Packages
import {shell, autoUpdater, clipboard, dialog} from 'electron'
import moment from 'moment'
import notify from 'display-notification'

// Ours
import {deploy, share, error} from './dialogs'
import {connector} from './api'

// Determine if an update is ready to be installed
// Based on an environment variable
const updateAvailable = process.env.UPDATE_AVAILABLE || false

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
            text: 'Your clipboard now contains the URL of your deployment.'
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
            text: 'The deployment is being deleted from our infrastructure. We\'ll let you know once it\'s gone!'
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
            text: 'The deployment has successfully been deleted.'
          })
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

export async function menuItems(app, tray, config, deployments) {
  let hasDeployments = false

  if (Array.isArray(deployments) && deployments.length > 0) {
    hasDeployments = true
  }

  return [
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      role: 'about'
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
          click() {
            config.delete('now.user')
            const existent = config.has('now.user')

            if (existent) {
              error('Couldn\'t log out')
            }

            // Restart the application
            app.relaunch()
            app.exit(0)
          }
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
