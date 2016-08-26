// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'

// Ours
import Title from './components/title'
import Login from './components/login'
import sliderStyles from './styles/slider'
import introStyles from './styles/intro'
import logoSVG from './vectors/logo.svg'

const anchor = document.getElementById('anchor')

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  arrows: false
}

const Sections = React.createClass({
  render() {
    return (
      <Slider {...sliderSettings}>
        <section id="intro" style={sliderStyles.section}>
          <SVGinline svg={logoSVG} width="100px"/>

          <h1 style={introStyles.heading}>
            <b>now:</b> realtime deployments made easy
          </h1>
        </section>

        <section id="login" style={sliderStyles.section}>
          <Login/>
        </section>
      </Slider>
    )
  }
})

const mainStyles = {
  height: 'inherit'
}

ReactDOM.render((
  <main style={mainStyles}>
    <Title/>
    <Sections/>
  </main>
), anchor)
