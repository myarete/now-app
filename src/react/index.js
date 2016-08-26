// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'

// Ours
import Title from './components/title'
import introStyles from './styles/intro'
import sliderStyles from './styles/slider'

const anchor = document.getElementById('anchor')

const sliderSettings = {
  speed: 500,
  infinite: false,
  arrows: false
}

const mainStyles = {
  height: 'inherit'
}

const Sections = React.createClass({
  render() {
    return (
      <Slider {...sliderSettings}>
        <section id="intro" style={sliderStyles.section}>
          <img src="../vectors/logo.svg" style={introStyles.image}/>

          <h1 style={introStyles.heading}>
            <b>now:</b> realtime deployments made easy
          </h1>
        </section>

        <section id="usage" style={sliderStyles.section}>
          dd
        </section>

        <section id="login" style={sliderStyles.section}>
          dsaads
        </section>
      </Slider>
    )
  }
})

ReactDOM.render((
  <main style={mainStyles}>
    <Title/>
    <Sections/>
  </main>
), anchor)
