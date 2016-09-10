// Packages
import {remote} from 'electron'
import fs from 'fs-promise'

// Ours
import showError from './error'

// Load from main process
const sudo = remote.require('sudo-prompt')

export default async () => {
  const utils = remote.getGlobal('binaryUtils')

  const downloadURL = await utils.getURL()
  const location = await utils.download(downloadURL)

  const destination = utils.getPath()
  const command = 'mv ' + location.path + ' ' + destination + '/now'

  // If there's an existing binary, rename it
  try {
    await utils.handleExisting()
  } catch (err) {}

  const sudoOptions = {
    name: 'Now'
  }

  sudo.exec(command, sudoOptions, async (error, stdout, stderr) => {
    if (error) {
      showError('Not able to move binary', error)
      return
    }

    // Copy permissions of node binary
    let nodeStats

    try {
      nodeStats = await fs.stat(destination + '/node')
    } catch (err) {
      console.error(err)
    }

    if (nodeStats) {
      await fs.chmod(destination + '/now', nodeStats.mode)
    }

    console.log(stdout)
    console.log(stderr)

    // Let the user know where finished
    console.log('Done!')

    // Remove temporary directory
    location.cleanup()
  })
}
