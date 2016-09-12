const states = {
  hide: false,
  show: true,
  minimize: false,
  restore: true,
  focus: true
}

const windowLeft = win => {
  if (global.about === win && global.tutorial.isVisible()) {
    return true
  }

  if (global.tutorial === win && global.about.isVisible()) {
    return true
  }

  return false
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
      // Don't toggle highlighting if one window is still open
      if (windowLeft(win)) {
        return
      }

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
