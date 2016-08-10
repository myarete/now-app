import {shell} from 'electron'
import {share, deploy} from './utils/actions'
import {app} from './utils'

export default function (details) {
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
      click: share
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
          label: details.email || 'No user defined',
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
