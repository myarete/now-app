// Native
import path from 'path'

// Packages
import {Glob} from 'glob'
import fs from 'fs-promise'

// Ours
import injectPackage from './inject'

export default (content, tmp, defaults) => {
  // Ignore packages
  const walker = new Glob('**', {
    cwd: content,
    dot: true,
    strict: true,
    mark: true,
    ignore: [
      'node_modules'
    ]
  })

  walker.on('match', async item => {
    walker.pause()

    const file = path.join(content, item)
    const target = path.join(tmp + '/content', path.relative(content, file))

    // Once a file is found, copy it to the temp directory
    try {
      await fs.copy(file, target)
    } catch (err) {
      throw err
    }

    walker.resume()
  })

  walker.on('end', async () => await injectPackage(tmp, defaults))
}
