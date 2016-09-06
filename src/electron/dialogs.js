// Packages
import {dialog, shell} from 'electron'

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

export function error(detail, trace) {
  const goAway = dialog.showMessageBox({
    type: 'error',
    message: 'An error occured',
    detail,
    buttons: [
      'Report it',
      'Go away'
    ]
  })

  let url = 'https://github.com/zeit/now-app/issues/new'

  if (!trace) {
    if (!goAway) {
      shell.openExternal(url)
    }

    return
  }

  if (trace instanceof Error) {
    trace = trace.stack.toString()
  }

  console.error(detail)
  console.error(trace)

  if (!goAway) {
    url += '?body=' + encodeURIComponent(trace)
    url += '&title=' + encodeURIComponent(detail)

    shell.openExternal(url)
  }
}
