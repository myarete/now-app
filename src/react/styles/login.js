export default {
  input: {
    normal: {
      border: 0,
      outline: 0,
      background: 'transparent',
      borderBottomStyle: 'solid',
      borderBottomWidth: '2px',
      borderBottomColor: '#626262',
      fontSize: '12px',
      color: '#666',
      minWidth: 250,
      height: 32,
      lineHeight: 32,
      textAlign: 'center',
      fontFamily: 'Menlo, Monaco, Lucida Console, Liberation Mono, serif',
      transition: 'border-bottom-color .1s ease-in, color .1s ease-in',
      maxWidth: 380
    },
    focus: {
      color: '#fff',
      borderBottomColor: '#fff'
    },
    error: {
      color: '#ff286a',
      borderBottomColor: '#ff286a',
      animation: 'shake 1s both'
    },
    verifying: {
      background: '#1aad57',
      borderBottomColor: '#1aad57',
      color: '#fff'
    }
  },
  text: {
    textAlign: 'center',
    margin: '0',
    fontSize: '15px',
    width: '260px',
    lineHeight: '21px',
    marginBottom: '40px'
  }
}
