import React from 'react'
import styling from '../styles/title'

export default React.createClass({
  render() {
    return (
      <aside id="window-title" style={styling.title}>
        <h1 style={styling.heading}>Welcome to now</h1>
      </aside>
    )
  }
})
