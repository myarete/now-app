// Natives
import path from 'path'

// Packages
import fs from 'fs-promise'

// Ours
import deploy from '../actions/deploy'

export default async (tmpDir, defaults) => {
  const pkgPath = path.join(tmpDir, 'package.json')

  try {
    await fs.writeJSON(pkgPath, defaults)
  } catch (err) {
    throw err
  }

  await deploy(tmpDir, true)
}
