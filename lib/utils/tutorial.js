import {BrowserWindow} from 'electron'

const windowSpecs = {
  width: 800,
  height: 600,
  title: 'Getting started with Zeit',
  resizable: false,
  center: true
}

export default function () {
  const window = new BrowserWindow(windowSpecs)
  window.loadURL(`file://${__dirname}/../../pages/welcome.html`)

  return window
}
