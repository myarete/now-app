import {remote} from 'electron'

export default (detail, trace) => {
  const current = remote.getCurrentWindow()

  remote.dialog.showMessageBox(current, {
    type: 'error',
    buttons: [
      'Ok'
    ],
    message: 'An error occured',
    detail
  })

  console.error(trace)
}
