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

const anchor = document.getElementById('anchor')

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  arrows: false,
  draggable: false,
  afterChange(index) {
    const loginInput = window.loginInput

    if (!loginInput) {
      return
    }

    const slider = document.querySelector('.slick-track')
    const slideCount = slider.childElementCount

    // If it's the last slide, auto-focus on input
    if (index === slideCount) {
      loginInput.focus()
    } else {
      loginInput.blur()
    }
  }
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
          <p style={loginStyles.text}>To start using the app, simply enter your email address below.</p>
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
