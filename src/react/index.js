// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'

// Components
import Title from './components/title'
import Login from './components/login'

// Styles
import sliderStyles from './styles/slider'
import introStyles from './styles/intro'
import loginStyles from './styles/login'

// Vectors
import logoSVG from './vectors/logo.svg'
import waveSVG from './vectors/wave.svg'

const anchor = document.getElementById('anchor')

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  arrows: false,
  draggable: false
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
          <aside style={loginStyles.aside}>
            <SVGinline svg={waveSVG} width="60px"/>
            <p style={loginStyles.text}>To start using the app, simply enter your email address below.</p>
          </aside>

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
