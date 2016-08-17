// Native
import path from 'path'
import fs from 'fs-promise'

// Packages
import userHome from 'user-home'
import pathExists from 'path-exists'

// Ours
import {error as showError} from '../dialogs'

export default async app => {
  const configFile = path.join(userHome, '.now.json')

  if (!await pathExists(configFile)) {
    return showError('Couldn\'t log out')
  }

  try {
    await fs.remove(configFile)
  } catch (err) {
    return showError(err)
  }

  // Restart the application
  app.relaunch()
  app.exit(0)
}
