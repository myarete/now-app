// Native
import path from 'path'
import fs from 'fs-promise'

// Packages
import pathExists from 'path-exists'
import glob from 'glob-promise'
import {dir as isDirectory} from 'path-type'
import {isTextSync as isText} from 'istextorbinary'
import {clipboard, shell} from 'electron'
import chalk from 'chalk'

// Ours
import {connector} from '../api'
import {error as showError} from '../dialogs'
import notify from '../notify'

const ignoredFiles = [
  '.DS_Store'
]

export default async (folder, sharing) => {
  const details = {}

  const dir = path.resolve(folder)

  const pkgFile = path.join(dir, 'package.json')
  const dockerFile = path.join(dir, 'Dockerfile')

  const nodeProject = await pathExists(pkgFile)
  const dockerProject = await pathExists(dockerFile)

  // Ignore the project if there's no package file
  if (!nodeProject && !await pathExists(dockerFile)) {
    return showError('Not a valid project!')
  }

  notify({
    title: 'Uploading files...',
    body: 'Your files are being uploaded to our servers.'
  })

  // Log separator
  if (!sharing) {
    console.log(chalk.grey('---'))
  }

  let projectName = 'docker project'
  // const propertyName = nodeProject ? 'package' : 'package.json'
  const propertyName = 'package.json'

  if (nodeProject) {
    // Load the package file
    let packageJSON

    try {
      packageJSON = await fs.readJSON(pkgFile)
    } catch (err) {
      showError('Not able to load package file', err)
      return
    }

    details[propertyName] = dockerProject ? JSON.stringify(packageJSON) : packageJSON
  }

  if (nodeProject) {
    projectName = details[propertyName].name
  }

  const logStatus = message => console.log(chalk.yellow(`[${projectName}]`) + ' ' + message)

  let items

  try {
    items = await glob(path.join(dir, '**'), {
      dot: true,
      strict: true,
      recursive: true,
      mark: true,
      ignore: [
        '**/node_modules/**',
        '**/.git/**'
      ]
    })
  } catch (err) {
    showError('Could not read directory to deploy', err)
    return
  }

  for (const itemPath of items) {
    const itemDetails = path.parse(itemPath)
    const fileName = itemDetails.base
    const relativePath = path.relative(dir, itemPath)

    let isDir

    try {
      isDir = await isDirectory(itemPath)
    } catch (err) {
      showError('Not able to test if deployment is a directory', err)
      return
    }

    if (!isDir && !ignoredFiles.includes(fileName) && relativePath !== 'package.json') {
      let fileContent

      try {
        fileContent = await fs.readFile(itemPath)
      } catch (err) {
        showError('Could not read file for deployment', err)
        continue
      }

      // Find out if the file is text-based or binary
      const fileIsText = isText(fileName, fileContent)

      if (!fileIsText) {
        details[relativePath] = {
          binary: true,
          content: fileContent.toString('base64')
        }

        continue
      }

      details[relativePath] = fileContent.toString()
    }
  }

  let deployment
  const apiSession = connector()

  try {
    deployment = await apiSession.createDeployment(details)
  } catch (err) {
    showError('Could not create deployment', err.toString())
    return
  }

  if (!deployment) {
    // Trigger an error if the deployment didn't work
    showError('Not able to deploy')
    return
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
        showError('Not able to get deployment', err)
        return
      }

      if (current.state === 'READY') {
        clearInterval(checker)

        notify({
          title: 'Done ' + (sharing ? 'sharing' : 'deploying') + '!',
          body: 'Opening the URL in your browser...'
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
    body: 'Your clipboard already contains the URL.'
  })

  // Delete the local deployed directory if required
  if (sharing) {
    try {
      await fs.remove(folder)
    } catch (err) {
      showError('Could not remove temporary directory', err)
      return
    }

    logStatus('Removed temporary directory')
  }
}
