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
      transition: 'all .1s ease-in',
      maxWidth: 380,
      marginTop: '40px'
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
      display: 'none'
    }
  },
  text: {
    textAlign: 'center',
    margin: '0',
    fontSize: '15px',
    lineHeight: '24px',
    whiteSpace: 'pre'
  },
  button: {
    normal: {
      background: '#191919',
      textAlign: 'center',
      textDecoration: 'none',
      color: '#d0d0d0',
      fontSize: '15px',
      padding: '10px 20px',
      marginTop: '30px',
      transition: 'all 0.4s ease',
      cursor: 'pointer'
    },
    hover: {
      background: '#383838',
      color: '#fff'
    }
  }
}
