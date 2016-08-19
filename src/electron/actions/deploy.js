// Native
import path from 'path'
import fs from 'fs-promise'

// Packages
import pathExists from 'path-exists'
import {Glob} from 'glob'
import {dir as isDirectory} from 'path-type'
import {isTextSync as isText} from 'istextorbinary'
import {clipboard, shell} from 'electron'
import notify from 'display-notification'
import chalk from 'chalk'

// Ours
import session from '../api'
import {error as showError} from '../dialogs'

const ignoredFiles = [
  '.DS_Store'
]

export default async (folder, sharing) => {
  const details = {}

  const dir = path.resolve(folder)
  const pkgFile = path.join(dir, 'package.json')

  // Ignore the project if there's no package file
  if (!await pathExists(pkgFile)) {
    return showError('Not a node project!')
  }

  // Log separator
  if (!sharing) {
    console.log(chalk.grey('---'))
  }

  // Load the package file
  try {
    details.package = await fs.readJSON(pkgFile)
  } catch (err) {
    return showError(err)
  }

  const logStatus = message => console.log(chalk.yellow(`[${details.package.name}]`) + ' ' + message)

  const walker = new Glob('**', {
    cwd: dir,
    dot: true,
    strict: true,
    mark: true
  })

  walker.on('match', async item => {
    walker.pause()

    const itemPath = path.join(dir, item)
    const fileName = path.parse(itemPath).name

    let isDir

    try {
      isDir = await isDirectory(itemPath)
    } catch (err) {
      return showError(err)
    }

    if (!isDir && !ignoredFiles.includes(fileName) && item !== 'package.json') {
      let fileContent

      try {
        fileContent = await fs.readFile(itemPath)
      } catch (err) {
        showError(err)
        walker.resume()
        return
      }

      // Find out if the file is text-based or binary
      const fileIsText = isText(fileName, fileContent)

      // If its a binary one, ignore it
      // This is just temporary, we need to support them later
      if (!fileIsText) {
        walker.resume()
        return
      }

      // Make the file's content readable
      const stringContent = Buffer.from(fileContent).toString()
      details[item] = stringContent
    }

    walker.resume()
  })

  walker.on('end', async () => {
    let deployment
    const apiSession = session()

    try {
      deployment = await apiSession.createDeployment(details)
    } catch (err) {
      return showError(err)
    }

    if (!deployment) {
      // Trigger an error if the deployment didn't work
      showError('Not able to deploy')
    }

    const url = 'https://' + deployment.host

    if (deployment.state === 'READY') {
      // Open the URL in the default browser
      shell.openExternal(url)

      // Log the current state of the deployment
      logStatus(deployment.state)
    } else {
      // If the deployment isn't ready, regularly check for the state
      const checker = setInterval(async () => {
        let current

        try {
          current = await apiSession.getDeployment(deployment.uid)
        } catch (err) {
          return showError(err)
        }

        if (current.state === 'READY') {
          clearInterval(checker)

          notify({
            title: 'Done ' + (sharing ? 'sharing' : 'deploying') + '!',
            text: 'Opening the URL in your browser...'
          })

          // Open the URL in the default browser
          shell.openExternal(url)
        }

        // Log the current state of the deployment
        logStatus(current.state)
      }, 3000)
    }

    // Copy deployment URL to clipboard
    clipboard.writeText(url)

    const genTitle = () => {
      if (deployment.state === 'READY') {
        return 'Already deployed!'
      }

      return (sharing ? 'Sharing' : 'Deploying') + '...'
    }

    // Let the user now
    notify({
      title: genTitle(),
      text: 'Your clipboard already contains the URL.'
    })

    // Delete the local deployed directory if required
    if (sharing) {
      try {
        await fs.remove(folder)
      } catch (err) {
        return showError(err)
      }

      logStatus('Removed temporary directory')
    }
  })
}
