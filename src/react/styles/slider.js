export default {
  section: {
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  arrow: {
    all: {
      height: '100vh',
      zIndex: '4000',
      top: 0,
      position: 'fixed',
      width: 50,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to left, #000, transparent)',
      cursor: 'pointer'
    },
    prev: {
      left: 0,
      transform: 'rotate(180deg)'
    },
    next: {
      right: 0
    }
  }
}
