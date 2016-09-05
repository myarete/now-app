// Native
import path from 'path'

const modulePaths = async () => {
  const modules = process.mainModule.children
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

export default async () => {
  const paths = await modulePaths()

  console.log(paths)
}
