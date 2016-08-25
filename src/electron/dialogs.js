// Packages
import {dialog} from 'electron'

// Ours
import deployment from './actions/deploy'
import sharing from './actions/share'

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  return false
}

export async function share(tray) {
  const info = {
    title: 'Select something to share',
    properties: [
      'openDirectory',
      'openFile'
    ],
    buttonLabel: 'Share'
  }

  tray.setHighlightMode('always')
  const path = showDialog(info)
  tray.setHighlightMode('never')

  if (!path) {
    return
  }

  try {
    await sharing(path)
  } catch (err) {
    error(err)
  }
}

export async function deploy(tray) {
  const info = {
    title: 'Select a folder to deploy',
    properties: [
      'openDirectory'
    ],
    buttonLabel: 'Deploy'
  }

  tray.setHighlightMode('always')
  const path = showDialog(info)
  tray.setHighlightMode('never')

  if (path) {
    try {
      await deployment(path)
    } catch (err) {
      error(err)
    }
  }
}

export function error(detail) {
  if (detail instanceof Error) {
    detail = detail.stack.toString()
    console.error(detail)
  }

  dialog.showMessageBox({
    type: 'error',
    message: 'An error occured',
    detail,
    buttons: [
      'Got it'
    ]
  })
}
