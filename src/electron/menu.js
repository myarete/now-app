// Packages
import {shell} from 'electron'

// Ours
import {deploy, share, error} from './dialogs'

export default async (app, tray, config) => {
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
      label: 'Documentation...',
      click: () => shell.openExternal('https://zeit.co/now')
    },
    {
      label: 'Account',
      submenu: [
        {
          label: process.env.USER_EMAIL || 'No user defined',
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
      type: 'separator'
    },
    {
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      click: app.quit,
      role: 'quit'
    }
  ]
}
