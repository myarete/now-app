// Packages
import React from 'react'
import autoSizeInput from 'autosize-input'

// Ours
import styles from '../styles/login'

export default React.createClass({
  getInitialState() {
    return {
      value: '',
      focus: false
    }
  },
  handleChange(event) {
    this.setState({
      value: event.target.value
    })
  },
  handleKey(event) {
    if (event.keyCode !== 13) {
      return
    }

    const value = this.state.value

    if (!/^.+@.+\..+$/.test(value)) {
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
    const input = this.refs.loginInput

    autoSizeInput(input, {
      minWidth: false
    })
  },
  render() {
    const inputStyles = styles.input
    const hoverStyle = Object.assign({}, inputStyles.normal, inputStyles.focus)
    const style = this.state.focus ? hoverStyle : inputStyles.normal

    const inputProps = {
      type: 'email',
      value: this.state.value,
      onChange: this.handleChange,
      onKeyDown: this.handleKey,
      placeholder: 'you@youremail.com',
      onFocus: this.toggleFocus,
      onBlur: this.toggleFocus,
      ref: 'loginInput',
      style
    }

    return <input {...inputProps}/>
  }
})
