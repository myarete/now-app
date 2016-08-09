import {
  app as init,
  dialog
} from 'electron'

init.dock.hide()
init.setName('Now')

export const app = init

export function showError(detail) {
  dialog.showMessageBox({
    type: 'error',
    message: 'An error occured',
    detail,
    buttons: [
      'Got it'
    ]
  })

  init.quit()
}
