import notify from 'display-notification'
import { clipboard, dialog } from 'electron'
import { spawn } from 'child_process'
import { showError } from './'

export function run (cmd, path) {
  path = path.replace(/ /g, '\\ ')
  const uploader = spawn(cmd, [path])

  let notified = false,
      failed = false

  uploader.stdout.on('data', data => {
    const dataString = String(data)

    if (dataString.includes('.now.sh (copied to clipboard)') && notified == false) {
      notified = true

      const url = /https:\/\/(.*)-(.*).now.sh/g.exec(dataString)
      clipboard.writeText(url[0])

      notify({
        title: cmd == 'ns' ? 'Sharing files...' : 'Deploying directory...',
        text: 'Your clipboard already contains the URL.',
        sound: 'Pop'
      })
    }
  })

  uploader.stderr.on('data', data => {
    const dataString = String(data)

    if (dataString.includes('Rate limit exceeded')) {
      showError('Rate limit exceeded')
      failed = true
    }
  })

  uploader.on('close', code => {
    if (failed) {
      return
    }

    if (code == 1) {
      showError('Not able to upload files...')
      return
    }

    notify({
      title: cmd == 'ns' ? 'Done sharing!' : 'Done deploying!',
      text: 'Successfully finished uploading all files.',
      sound: 'Pop'
    })
  })
}

export function showDialog (details) {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  showError('No file patch received...')
}

export function share (path) {
  const info = {
    title: 'Select something to share',
    properties: [
      'openDirectory',
      'openFile'
    ],
    buttonLabel: 'Share'
  }

  exports.run('ns', showDialog(info))
}

export function deploy (directory) {
  const info = {
    title: 'Select a folder to deploy',
    properties: [
      'openDirectory'
    ],
    buttonLabel: 'Deploy'
  }

  exports.run('now', showDialog(info))
}
