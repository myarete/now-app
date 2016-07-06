import notify from 'display-notification'
import { clipboard } from 'electron'
import { spawn } from 'child_process'

export function share (path) {
  const filePath = path.replace(/ /g, '\\ ')

  const uploader = spawn('ns', [
    filePath
  ])

  let notified = false

  uploader.stdout.on('data', data => {
    const dataString = String(data)

    if (dataString.includes('https://ns-') && notified == false) {
      notified = true

      const url = /https:\/\/ns-(.*).now.sh/g.exec(dataString)
      clipboard.writeText(url[0])

      notify({
        title: 'Sharing files...',
        text: 'Your clipboard already contains the URL.',
        sound: 'Pop'
      })
    }
  })

  uploader.on('close', code => {
    notify({
      title: 'Done sharing!',
      text: 'Successfully finished uploading all files.',
      sound: 'Pop'
    })
  })
}
