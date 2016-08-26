// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'

// Ours
import Title from './components/title'
import introStyles from './styles/intro'

const anchor = document.getElementById('anchor')

const sliderSettings = {
  speed: 500,
  infinite: false
}

const Sections = React.createClass({
  render() {
    return (
      <Slider {...sliderSettings}>
        <section id="intro">
          <img src="../vectors/logo.svg" style={introStyles.image}/>

          <h1 style={introStyles.heading}>
            <b>now:</b> realtime deployments made easy
          </h1>
        </section>

        <section id="usage">
        dd
        </section>

        <section id="login">
        dsaads
        </section>
      </Slider>
    )
  }
})

ReactDOM.render((
  <main>
    <Title/>
    <Sections/>
  </main>
), anchor)
