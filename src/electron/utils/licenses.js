// Native
import path from 'path'

// Packages
import fs from 'fs-promise'

const modulePaths = async modules => {
  const modulePaths = []

  for (const moduleInfo of modules) {
    const pathParts = moduleInfo.filename.split('/')
    let where = ''

    for (const part of pathParts) {
      const index = pathParts.indexOf(part)

      if (part === 'node_modules') {
        const position = index + 2

        for (let step = 0; step < position; step++) {
          where += pathParts[step] + '/'
        }

        break
      }
    }

    modulePaths.push(path.resolve(where))
  }

  return modulePaths
}

export default async modules => {
  const paths = await modulePaths(modules)

  const licenseNames = [
    'LICENSE.md',
    'LICENSE',
    'license.md',
    'license',
    'License'
  ]

  const licenses = {}

  for (const modulePath of paths) {
    const licensePaths = []

    for (const licenseName of licenseNames) {
      const position = path.join(modulePath, licenseName)
      licensePaths.push(position)
    }

    for (const licensePath of licensePaths) {
      let content

      try {
        content = await fs.readFile(licensePath, 'utf8')
      } catch (err) {
        continue
      }

      if (content) {
        const licenseDir = (path.parse(licensePath).dir)
        const moduleName = path.parse(licenseDir).name

        licenses[moduleName] = content
        break
      }
    }
  }

  if (!licenses) {
    return
  }

  return licenses
}
