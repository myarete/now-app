const states = {
  hide: false,
  show: true,
  minimize: false,
  restore: true
}

export default (win, tray) => {
  if (!tray) {
    return
  }

  for (const state in states) {
    if (!{}.hasOwnProperty.call(states, state)) {
      return
    }

    const highlighted = states[state]

    win.on(state, () => {
      tray.setHighlightMode(highlighted ? 'always' : 'never')
    })
  }

  win.on('close', event => {
    if (process.env.FORCE_CLOSE) {
      return
    }

    win.hide()
    event.preventDefault()
  })
}
