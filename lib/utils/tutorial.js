import {BrowserWindow} from 'electron'

const windowSpecs = {
  width: 600,
  height: 400,
  title: 'Getting started with Zeit',
  resizable: false,
  center: true,
  frame: false,
  show: false
}

const window = new BrowserWindow(windowSpecs)
window.loadURL(`file://${__dirname}/../../pages/welcome.html`)

export function show() {
  window.show()
}
