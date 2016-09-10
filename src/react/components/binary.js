// Packages
import React from 'react'

// Ours
import installBinary from '../utils/load-binary'

export default React.createClass({
  getInitialState() {
    return {
      binaryInstalled: false
    }
  },
  render() {
    const binaryButton = {
      className: 'button install',
      onClick: installBinary,
      disabled: this.state.binaryInstalled
    }

    let installText = 'Install now'

    if (this.state.binaryInstalled) {
      installText = 'Already installed'
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
