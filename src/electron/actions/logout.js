// Packages
import Config from 'electron-config'

// Ours
import {error as showError} from '../dialogs'

export default app => {
  const config = new Config()

  config.delete('now.user')
  const existent = config.has('now.user')

  if (existent) {
    showError('Couldn\'t log out')
  }

  // Restart the application
  app.relaunch()
  app.exit(0)
}
