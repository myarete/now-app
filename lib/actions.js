// Native
import path from 'path'
import fs from 'fs-extra'

// Packages
import fileExists from 'file-exists'
import toPromise from 'denodeify'
import notify from 'display-notification'
import {isText} from 'istextorbinary'
import {clipboard, shell} from 'electron'
import tmp from 'tmp'
import md5 from 'md5'
import isDirectory from 'is-directory'
import {Glob} from 'glob'
import dasherize from 'dasherize'

// Ours
import session from './api'

const ignoredFiles = [
  '.DS_Store'
]

export function injectPackage(tmpDir, defaults) {
  const pkgPath = path.join(tmpDir, 'package.json')

  fs.writeJSON(pkgPath, defaults, err => {
    if (err) {
      throw err
    }

    deploy(tmpDir, true)
  })
}

export function copyContents(content, tmp, defaults) {
  // Ignore packages
  const walker = new Glob('**', {
    cwd: content,
    dot: true,
    strict: true,
    mark: true,
    ignore: [
      'node_modules'
    ]
  })

  walker.on('match', item => {
    walker.pause()

    const file = path.join(content, item)
    const target = path.join(tmp + '/content', path.relative(content, file))

    // Once a file is found, copy it to the temp directory
    fs.copy(file, target, err => {
      if (err) {
        throw err
      }

      walker.resume()
    })
  })

  walker.on('end', () => injectPackage(tmp, defaults))
}

export function deploy(folder, sharing) {
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
        fileContent = await toPromise(fs.readFile)(itemPath)
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
        fs.remove(folder, err => {
          if (err) {
            console.error(err)
          }

          console.log('Removed temporary folder')
        })
      }

      return
    }

    // Trigger an error if the deployment didn't work
    console.error('Not able to deploy')
  })
}

export async function share(item) {
  const uniqueIdentifier = md5(item)
  const itemName = path.parse(item).name

  const pkgDefaults = {
    name: dasherize(itemName),
    version: '1.0.0',
    scripts: {
      start: 'list ./content'
    },
    dependencies: {
      'micro-list': 'latest'
    }
  }

  let tmpDir = false

  try {
    tmpDir = await toPromise(tmp.dir)({
      // We need to use the hased directory identifier
      // Because if we don't use the same id every time,
      // now won't update the existing deployment and create a new one instead
      name: `now-app-${uniqueIdentifier}`,

      // Keep it, because we'll remove it manually later
      keep: true
    })
  } catch (err) {
    throw err
  }

  console.log('Created temporary directory for sharing')
  const details = fs.lstatSync(item)

  if (details.isDirectory()) {
    copyContents(item, tmpDir, pkgDefaults)
  } else if (details.isFile()) {
    const fileName = path.parse(item).base
    const target = path.join(tmpDir, '/content', fileName)

    fs.copy(item, target, err => {
      if (err) {
        throw err
      }

      injectPackage(tmpDir, pkgDefaults)
    })
  } else {
    console.error('Path is neither a file nor a directory!')
  }
}
