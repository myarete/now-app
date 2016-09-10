// Packages
import React from 'react'
import {remote} from 'electron'

// Ours
import installBinary from '../utils/load-binary'

export default React.createClass({
  getInitialState() {
    return {
      binaryInstalled: false
    }
  },
  async componentDidMount() {
    const binaryUtils = remote.getGlobal('binaryUtils')
    const binaryPath = binaryUtils.getPath() + '/now'

    const exists = remote.require('path-exists')

    if (await exists(binaryPath)) {
      this.setState({
        binaryInstalled: true
      })
    }
  },
  render() {
    const element = this

    let classes = 'button install'
    let installText = 'Install now'

    if (this.state.binaryInstalled) {
      classes += ' off'
      installText = 'Already installed'
    }

    const binaryButton = {
      className: classes,
      async onClick() {
        if (element.state.binaryInstalled) {
          return
        }

        await installBinary()
      }
    }

    return (
      <article>
        <p>Bye the way: You can use <code>now</code> from the command line for more advanced features.</p>
        <p>Press the button below to place <code>now</code> in <code>/usr/local/bin</code>. In the future, we&#39;ll keep it updated for you automatically.</p>

        <a {...binaryButton}>{installText}</a>
      </article>
    )
  }
})
