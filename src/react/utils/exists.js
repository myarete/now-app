import {remote} from 'electron'

const fs = remote.require('fs-promise')

export default async file => {
  try {
    await fs.stat(file)
  } catch (err) {
    return false
  }

  return true
}
