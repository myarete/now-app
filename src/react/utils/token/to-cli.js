// Packages
import {remote} from 'electron'

export default async (mail, token) => {
  const path = remote.require('path')
  const os = remote.require('os')
  const fs = remote.require('fs-promise')

  const filePath = path.join(os.homedir(), '.now.json')

  try {
    await fs.ensureFile(filePath)
  } catch (err) {
    console.error(err)
    return
  }

  let currentContent = {}

  try {
    currentContent = await fs.readJSON(filePath)
  } catch (err) {}

  currentContent.email = mail
  currentContent.token = token

  try {
    await fs.writeJSON(filePath, currentContent)
  } catch (err) {
    console.error('Could not overwrite .now.json')
  }
}
