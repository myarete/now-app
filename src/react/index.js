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
import arrowSVG from './vectors/arrow.svg'

const anchor = document.getElementById('anchor')

const SliderArrows = React.createClass({
  propTypes: {
    direction: React.PropTypes.string.isRequired,
    className: React.PropTypes.string
  },
  getInitialState() {
    return {
      hover: false
    }
  },
  handleHover() {
    this.setState({
      hover: !this.state.hover
    })
  },
  render() {
    let styles = sliderStyles.arrow.all
    const direction = this.props.direction

    if (direction) {
      styles = Object.assign({}, styles, sliderStyles.arrow[direction])
    }

    const isDisabled = this.props.className.split(' ').includes('slick-disabled')

    if (!isDisabled) {
      styles.opacity = 0.5

      if (this.state.hover) {
        styles.opacity = 1
      }
    }

    return (
      <div {...this.props} style={styles} onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}>
        <SVGinline svg={arrowSVG} width="20px"/>
      </div>
    )
  }
})

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  draggable: false,
  nextArrow: <SliderArrows direction="next"/>,
  prevArrow: <SliderArrows direction="prev"/>,
  afterChange(index) {
    const input = window.loginInput
    const video = window.usageVideo

    if (!input || !video) {
      return
    }

    const slider = document.querySelector('.slick-track')
    const slideCount = slider.childElementCount

    // If it's the last slide, auto-focus on input
    if (index === slideCount - 1) {
      input.focus()
    } else {
      input.blur()
    }

    if (index === 1) {
      setTimeout(() => video.play(), 500)
    } else {
      setTimeout(() => {
        video.pause()
        video.currentTime = 0
      }, 500)
    }
  }
}

const Sections = React.createClass({
  getInitialState() {
    return {
      fading: false
    }
  },
  render() {
    const videoSettings = {
      width: 490,
      preload: true,
      loop: true,
      src: '../assets/usage.webm',
      ref: c => {
        window.usageVideo = c
      }
    }

    return (
      <Slider {...sliderSettings}>
        <section id="intro" style={sliderStyles.section}>
          <SVGinline svg={logoSVG} width="90px"/>

          <h1 style={introStyles.heading}>
            <b>now:</b> realtime deployments made easy
          </h1>
        </section>

        <section id="usage" style={sliderStyles.section}>
          <video {...videoSettings}/>
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
