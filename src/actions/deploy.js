// Native
import path from 'path'
import fs from 'fs-promise'

// Packages
import fileExists from 'file-exists'
import {Glob} from 'glob'
import toPromise from 'denodeify'
import isDirectory from 'is-directory'
import {isText} from 'istextorbinary'
import {clipboard, shell} from 'electron'
import notify from 'display-notification'

// Ours
import session from '../api'

const ignoredFiles = [
  '.DS_Store'
]

export default (folder, sharing) => {
  const details = {}

  const dir = path.resolve(folder)
  const pkgFile = path.join(dir, 'package.json')

  // Ignore the project if there's no package file
  if (!fileExists(pkgFile)) {
    console.log('Not a node project!')
    return false
  }

  // Load the package file
  details.package = require(pkgFile)

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
      isDir = await toPromise(isDirectory)(itemPath)
    } catch (err) {
      console.error(err)
      return
    }

    if (!isDir && !ignoredFiles.includes(fileName) && item !== 'package.json') {
      let fileContent

      try {
        fileContent = await fs.readFile(itemPath)
      } catch (err) {
        console.error(err)
        walker.resume()
        return
      }

      // Find out if the file is text-based or binary
      const fileIsText = await toPromise(isText)(fileName, fileContent)

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
      console.error(err)
      return
    }

    if (deployment) {
      const url = 'https://' + deployment.host

      const checker = setInterval(async () => {
        let current

        try {
          current = await apiSession.getDeployment(deployment.uid)
        } catch (err) {
          console.error(err)
          return
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
        console.log(current)
      }, 5000)

      // Copy deployment URL to clipboard
      clipboard.writeText(url)

      // Let the user now
      notify({
        title: (sharing ? 'Sharing' : 'Deploying') + '...',
        text: 'Your clipboard already contains the URL.'
      })

      // Delete the local deployed directory if required
      if (sharing) {
        try {
          await fs.remove(folder)
        } catch (err) {
          console.error(err)
        }

        console.log('Removed temporary folder')
      }

      return
    }

    // Trigger an error if the deployment didn't work
    console.error('Not able to deploy')
  })
}
