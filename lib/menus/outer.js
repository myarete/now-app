import { app } from '../utils'
import showTutorial  from '../utils/tutorial'

export default [
  {
    label: 'Get Started...',
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
