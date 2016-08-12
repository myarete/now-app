// Native
import path from 'path'
import fs from 'fs-extra'

// Packages
import {walk} from 'walk'
import fileExists from 'file-exists'
import toPromise from 'denodeify'
import notify from 'display-notification'
import {isText} from 'istextorbinary'
import {clipboard, shell} from 'electron'
import tmp from 'tmp'
import md5 from 'md5'
import isDirectory from 'is-directory'
import {Glob} from 'glob'

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

    deploy(tmpDir)
  })
}

export function copyContents(content, tmp, defaults) {
  // Ignore packages
  const walker = walk(content, {
    filters: [
      'node_modules'
    ]
  })

  walker.on('file', (root, fileStats, next) => {
    const file = path.join(root, fileStats.name)
    const target = path.join(tmp + '/content', path.relative(content, file))

    // Once a file is found, copy it to the temp directory
    fs.copy(file, target, err => {
      if (err) {
        throw err
      }

      next()
    })
  })

  walker.on('errors', (root, nodeStatsArray, next) => {
    console.error(`Not able to copy file: ${nodeStatsArray}`)
    next()
  })

  walker.on('end', () => injectPackage(tmp, defaults))
}

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

    try {
      deployment = await session().createDeployment(details)
    } catch (err) {
      console.error(err)
      return
    }

    if (deployment) {
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
    console.error('Not able to deploy')
  })
}

export async function share(item) {
  const uniqueIdentifier = md5(item)

  const pkgDefaults = {
    name: 'now-app',
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
