import {dialog} from 'electron'
import {deploy as deployment} from './actions'

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  console.error('No file patch received...')
}
/*
export function share() {
  const info = {
    title: 'Select something to share',
    properties: [
      'openDirectory',
      'openFile'
    ],
    buttonLabel: 'Share'
  }

  exports.run('ns', showDialog(info))
}*/

export function deploy() {
  const info = {
    title: 'Select a folder to deploy',
    properties: [
      'openDirectory'
    ],
    buttonLabel: 'Deploy'
  }

  deployment(showDialog(info))
}
