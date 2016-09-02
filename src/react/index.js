// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'
import {remote, shell} from 'electron'

// Components
import Title from './components/title'
import Login from './components/login'

// Vectors
import logoSVG from './vectors/logo.svg'
import arrowSVG from './vectors/arrow.svg'

const anchorWelcome = document.querySelector('#mount-welcome > div')
const anchorAbout = document.querySelector('#mount-about > div')

const SliderArrows = React.createClass({
  propTypes: {
    direction: React.PropTypes.string.isRequired,
    className: React.PropTypes.string
  },
  render() {
    return (
      <div {...this.props}>
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
    const inputElement = window.loginInputElement
    const video = window.usageVideo

    if (!input || !video) {
      return
    }

    const slider = document.querySelector('.slick-track')
    const slideCount = slider.childElementCount

    // If it's the last slide, auto-focus on input
    if (inputElement && input) {
      if (index === slideCount - 1) {
        inputElement.focus()
      } else if (!input.state.classes.includes('verifying')) {
        // Reset value of login form if not verifying
        input.setState(input.getInitialState())
      }
    }

    if (index === 1) {
      video.play()
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
      fading: false,
      loginShown: true,
      loginText: 'To start using the app, simply enter\nyour email address below.'
    }
  },
  tokenFromCLI() {
    const path = remote.require('path')
    const os = remote.require('os')
    const fs = remote.require('fs-promise')
    const Config = remote.require('electron-config')

    const root = this
    window.sliderElement = this

    const filePath = path.join(os.homedir(), '.now.json')
    const loader = fs.readJSON(filePath)

    loader.then(content => {
      const config = new Config()

      config.set('now.user.token', content.token)
      config.set('now.user.email', content.email)

      root.setState({
        loginShown: false,
        loginText: `You've already signed in once in the now CLI.\nBecause of this, you've now been logged in automatically.`
      })
    }).catch(() => {})
  },
  handleRestart() {
    const app = remote.app

    // Restart the application
    app.relaunch()
    app.exit(0)
  },
  render() {
    const videoSettings = {
      width: 560,
      preload: true,
      loop: true,
      src: '../assets/usage.webm',
      ref: c => {
        window.usageVideo = c
      }
    }

    const loginTextRef = element => {
      window.loginText = element
    }

    if (this.state.loginShown) {
      this.tokenFromCLI()
    }

    return (
      <Slider {...sliderSettings}>
        <section id="intro">
          <SVGinline svg={logoSVG} width="90px"/>

          <h1>
            <b>now:</b> realtime global deployments
          </h1>
        </section>

        <section id="usage">
          <video {...videoSettings}/>
        </section>

        <section id="login">
          <p ref={loginTextRef} dangerouslySetInnerHTML={{__html: this.state.loginText}}/>
          {this.state.loginShown ? <Login/> : <a href="#" onClick={this.handleRestart}>Get Started</a>}
        </section>
      </Slider>
    )
  }
})

const mainStyles = {
  height: 'inherit'
}

if (anchorWelcome) {
  ReactDOM.render((
    <main style={mainStyles}>
      <Title/>
      <Sections/>
    </main>
  ), anchorWelcome)
}

const AboutContent = React.createClass({
  componentDidMount() {
    const links = document.querySelectorAll('a')

    for (const link of links) {
      const url = link.href

      if (url) {
        link.addEventListener('click', event => {
          shell.openExternal(url)
          event.preventDefault()
        })
      }
    }
  },
  render() {
    return (
      <section id="about">
        <span className="window-title">About</span>

        <img src="../dist/app.ico"/>
        <h1>Now.app</h1>

        <h2>Version <b>{'1.0.0'}</b> {'(1w ago)'}</h2>
        <h2 className="update latest">{'You\'re running the latest version!'}</h2>

        <article>
          <h1>Authors</h1>
          <p>
            Leo Lamprecht (<a href="https://twitter.com/notquiteleo">@notquiteleo</a>)<br/>
            Evil Rabbit (<a href="https://twitter.com/evilrabbit_">@evilrabbit_</a>)<br/>
            Guillermo Rauch (<a href="https://twitter.com/rauchg">@rauchg</a>)
          </p>

          <h1>{'3rd party software'}</h1>
          <p>v8 (c) Google, Inc.</p>
        </article>

        <span className="copyright">Made by <b>ZEIT</b></span>

        <nav>
          <a href="https://zeit.co/now">Docs</a>
          <a href="https://github.com/zeit/now-app">Source</a>
          <a href="https://github.com/zeit/now-app/issues">Issue tracker</a>
        </nav>
      </section>
    )
  }
})

if (anchorAbout) {
  ReactDOM.render(<AboutContent/>, anchorAbout)
}
