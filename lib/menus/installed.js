import { shell } from 'electron'
import { share, deploy } from '../utils/actions'
import showTutorial  from '../utils/tutorial'
import app from '../utils/init'

export default [
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
    click () {
      shell.openExternal('https://zeit.co/now')
    }
  },
  {
    label: 'Tutorial...',
    click: showTutorial
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
