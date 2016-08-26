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
      width: 250,
      height: 32,
      lineHeight: 32,
      textAlign: 'center',
      fontFamily: 'Menlo, Monaco, Lucida Console, Liberation Mono, serif',
      transition: 'border-bottom-color .1s ease-in, color .1s ease-in'
    },
    focus: {
      color: '#fff',
      borderBottomColor: '#fff'
    }
  },
  text: {
    textAlign: 'left',
    margin: '6px 0 0 20px',
    fontSize: '15px',
    width: '260px',
    lineHeight: '21px'
  },
  aside: {
    flexDirection: 'row',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    marginBottom: '30px'
  }
}
