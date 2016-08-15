// Native
import path from 'path'
import fs from 'fs-promise'

// Packages
import md5 from 'md5'
import dasherize from 'dasherize'
import toPromise from 'denodeify'
import tmp from 'tmp'

// Ours
import injectPackage from '../utils/inject'
import copyContents from '../utils/copy'

export default async item => {
  const uniqueIdentifier = md5(item)
  const itemName = path.parse(item).name

  const pkgDefaults = {
    name: dasherize(itemName),
    version: '1.0.0',
    scripts: {
      start: 'list ./content'
    },
    dependencies: {
      'micro-list': 'latest'
    }
  }

  let tmpDir = false

  try {
    tmpDir = await toPromise(tmp.dir)({
      // We need to use the hased directory identifier
      // Because if we don't use the same id every time,
      // now won't update the existing deployment and create a new one instead
      name: `now-app-${uniqueIdentifier}`,

      // Keep it, because we'll remove it manually later
      keep: true
    })
  } catch (err) {
    throw err
  }

  console.log('Created temporary directory for sharing')
  const details = await fs.lstat(item)

  if (details.isDirectory()) {
    copyContents(item, tmpDir, pkgDefaults)
  } else if (details.isFile()) {
    const fileName = path.parse(item).base
    const target = path.join(tmpDir, '/content', fileName)

    try {
      await fs.copy(item, target)
    } catch (err) {
      throw err
    }

    await injectPackage(tmpDir, pkgDefaults)
  } else {
    console.error('Path is neither a file nor a directory!')
  }
}
