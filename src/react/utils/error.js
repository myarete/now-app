import {remote} from 'electron'

export default detail => {
  const current = remote.getCurrentWindow()

  remote.dialog.showMessageBox(current, {
    type: 'error',
    buttons: [
      'Ok'
    ],
    message: 'An error occured',
    detail
  })
}
