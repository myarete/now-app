// Packages
import {dialog} from 'electron'

// Ours
import {
  deploy as deployment,
  share as sharing
} from './actions'

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  console.error('No file patch received...')
}

export async function share() {
  const info = {
    title: 'Select something to share',
    properties: [
      'openDirectory',
      'openFile'
    ],
    buttonLabel: 'Share'
  }

  const path = showDialog(info)

  if (!path) {
    return
  }

  try {
    await sharing(path)
  } catch (err) {
    console.error(err)
  }
}

export function deploy() {
  const info = {
    title: 'Select a folder to deploy',
    properties: [
      'openDirectory'
    ],
    buttonLabel: 'Deploy'
  }

  const path = showDialog(info)

  if (path) {
    deployment(path)
  }
}

export function error(detail) {
  dialog.showMessageBox({
    type: 'error',
    message: 'An error occured',
    detail,
    buttons: [
      'Got it'
    ]
  })
}
