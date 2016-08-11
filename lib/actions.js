// Native
import path from 'path'
import fs from 'fs'

// Packages
import {walk} from 'walk'
import fileExists from 'file-exists'
import toPromise from 'denodeify'
import notify from 'display-notification'
import {isText} from 'istextorbinary'
import {clipboard, shell} from 'electron'

// Ours
import session from './api'

const ignoredFiles = [
  '.DS_Store',
  'package.json'
]

export function deploy(folder) {
  const details = {}

  const dir = path.resolve(folder)
  const pkgFile = path.join(dir, 'package.json')

  // Let the user know that deployment has started
  notify({
    title: 'Deploying...',
    text: 'We\'ll let you know once it\'s finished!'
  })

  // Ignore the project if there's no package file
  if (!fileExists(pkgFile)) {
    console.log('Not a node project!')
    return false
  }

  // Load the package file
  details.package = require(pkgFile)
  const walker = walk(dir)

  walker.on('file', async (root, fileStats, next) => {
    if (ignoredFiles.includes(fileStats.name)) {
      return next()
    }

    let fileContent
    const filePath = path.join(root, fileStats.name)

    try {
      fileContent = await toPromise(fs.readFile)(filePath)
    } catch (err) {
      console.error(err)
      return next()
    }

    // Find out if the file is text-based or binary
    const fileIsText = await toPromise(isText)(fileStats.name, fileContent)

    // If its a binary one, ignore it
    // This is just temporary, we need to support them later
    if (!fileIsText) {
      return next()
    }

    // Make the file's content readable
    const stringContent = Buffer.from(fileContent).toString()
    details[fileStats.name] = stringContent

    next()
  })

  walker.on('end', async () => {
    let deployment

    try {
      deployment = await session().createDeployment(details)
    } catch (err) {
      console.error(err)
      return
    }

    if (deployment && deployment.state === 'BOOTED') {
      const url = 'https://' + deployment.host

      // Copy deployment URL to clipboard
      clipboard.writeText(url)

      // Let the user now
      notify({
        title: 'Done deploying!',
        text: 'Your clipboard now contains the URL to the deployment.'
      })

      // And finally, open the URL in the default browser
      shell.openExternal(url)
      return
    }

    // Trigger an error if the deployment didn't work
    throw new Error('Not able to deploy')
  })
}
