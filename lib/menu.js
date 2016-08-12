// Packages
import {shell} from 'electron'

// Ours
import {deploy, share} from './dialogs'

export default async app => {
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
      click: await share
    },
    {
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      click: deploy
    },
    {
      type: 'separator'
    },
    {
      label: 'Documentation...',
      click() {
        shell.openExternal('https://zeit.co/now')
      }
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: process.env.USER_EMAIL || 'No user defined',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout'
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
