// Packages
import React from 'react'
import autoSizeInput from 'autosize-input'

// Ours
import styles from '../styles/login'

export default React.createClass({
  getInitialState() {
    return {
      value: '',
      focus: false,
      classes: []
    }
  },
  handleChange(event) {
    this.setState({
      value: event.target.value
    })
  },
  handleKey(event) {
    this.setState({
      classes: []
    })

    if (event.keyCode !== 13 || this.state.value === '') {
      return
    }

    const value = this.state.value

    if (!/^.+@.+\..+$/.test(value)) {
      this.setState({
        classes: [
          'error'
        ]
      })

      console.log('Not a valid email')
      return
    }

    console.log(value)
  },
  toggleFocus() {
    this.setState({
      focus: !this.state.focus
    })
  },
  componentDidMount() {
    const input = this.loginInput

    autoSizeInput(input, {
      minWidth: false
    })
  },
  render() {
    const classes = this.state.classes
    const inputStyles = styles.input

    const hoverStyle = Object.assign({}, inputStyles.normal, inputStyles.focus)
    const style = this.state.focus ? hoverStyle : inputStyles.normal

    if (classes.includes('error')) {
      Object.assign(style, inputStyles.error)
    }

    const inputProps = {
      type: 'email',
      value: this.state.value,
      onChange: this.handleChange,
      onKeyDown: this.handleKey,
      placeholder: 'you@youremail.com',
      onFocus: this.toggleFocus,
      onBlur: this.toggleFocus,
      ref: c => {
        this.loginInput = c
      },
      className: classes.join(' '),
      style
    }

    return <input {...inputProps}/>
  }
})
