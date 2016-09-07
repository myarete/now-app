// Packages
import {remote} from 'electron'

export default root => {
  const path = remote.require('path')
  const os = remote.require('os')
  const fs = remote.require('fs-promise')
  const Config = remote.require('electron-config')

  window.sliderElement = root

  const filePath = path.join(os.homedir(), '.now.json')
  const loader = fs.readJSON(filePath)

  loader.then(content => {
    const config = new Config()

    config.set('now.user.token', content.token)
    config.set('now.user.email', content.email)

    root.setState({
      loginShown: false,
      loginText: `You've already signed in once in the now CLI.\nBecause of this, you've now been logged in automatically.`
    })
  }).catch(() => {})
}
