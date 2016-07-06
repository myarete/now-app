import { execSync, exec } from 'child_process'
import { showError } from './utils'
import RegClient from 'npm-registry-client'
import notify from 'display-notification'

const npm = new RegClient()
const uri = 'https://registry.npmjs.org/now'

class Updater {
  constructor () {
    setInterval(this.check.bind(this), 30000)
  }

  check () {
    const local = String(this.localVersion())

    if (process.env.UPDATING) {
      return
    }

    const params = {
      timeout: 1000
    }

    process.env.UPDATING = true
    console.log('test')

    npm.get(uri, params, function (err, data, raw, res) {
      if (err) {
        return showError(String(err))
      }

      const remote = String(data['dist-tags'].latest)

      if (remote != local) {
        this.install(remote)
      }
    }.bind(this))
  }

  localVersion () {
    let number

    try {
      number = execSync('now -v')
    } catch (err) {
      return showError(String(err))
    }

    return String(number).replace('\n', '').split(' ')[2]
  }

  install (needed) {
    try {
      execSync('npm install -g now@' + needed)
    } catch (err) {
      return showError(String(err))
    }

    process.env.UPDATING = false

    notify({
      title: 'Updated now',
      text: 'Feel free to check out the new features!',
      sound: 'Pop'
    })
  }
}

export default Updater
