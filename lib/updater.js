import {execSync, spawn} from 'child_process'
import RegClient from 'npm-registry-client'
import notify from 'display-notification'
import {showError} from './utils'

let updating = false

const npm = new RegClient({
  log: {
    verbose() {},
    info() {},
    http() {}
  }
})

const uri = 'https://registry.npmjs.org/now'

class Updater {
  constructor() {
    // Check every ten minutes
    setInterval(this.check.bind(this), 60 * 100 * 100)
  }

  check() {
    const local = String(this.localVersion())

    if (updating) {
      return
    }

    const params = {
      timeout: 1000
    }

    console.log('Checking for update of module...')
    updating = true

    npm.get(uri, params, (err, data) => {
      if (err) {
        return showError(String(err))
      }

      const remote = String(data['dist-tags'].latest)

      if (remote === local) {
        console.log('No update available')
        updating = false
      } else {
        console.log('Installing update for module...')
        this.install(remote)
      }
    })
  }

  install(needed) {
    const installer = spawn('npm', ['install', '-g', 'now@' + needed])
    let failing = true

    installer.stdout.on('data', data => {
      if (String(data).includes('now@0.18.1')) {
        failing = false
      }
    })

    installer.on('close', code => {
      updating = false

      if (code === 1 || failing) {
        return
      }

      notify({
        title: 'Updated now',
        text: 'Feel free to check out the new features!',
        sound: 'Pop'
      })
    })
  }

  localVersion() {
    let number

    try {
      number = execSync('now -v')
    } catch (err) {
      return showError(String(err))
    }

    return String(number).replace('\n', '').split(' ')[2]
  }
}

export default Updater
