// Packages
import React from 'react'
import ReactDOM from 'react-dom'

// Ours
import Title from './components/title'

const anchor = document.getElementById('anchor')

const Intro = React.createClass({
  render() {
    return (
      <section id="intro">
        <img src="../vectors/logo.svg"/>
        <h1><b>now:</b> realtime deployments made easy</h1>
      </section>
    )
  }
})

ReactDOM.render((
  <section id="content">
    <Title/>
    <Intro/>

    <section id="stuff"/>
  </section>
), anchor)
