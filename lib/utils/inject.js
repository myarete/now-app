// Natives
import fs from 'fs'
import path from 'path'

// Ours
import {deploy} from '../actions'

export default (tmpDir, defaults) => {
  const pkgPath = path.join(tmpDir, 'package.json')

  fs.writeJSON(pkgPath, defaults, err => {
    if (err) {
      throw err
    }

    deploy(tmpDir, true)
  })
}
