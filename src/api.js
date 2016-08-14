import Now from 'now-api'

export default () => {
  const token = process.env.USER_TOKEN

  if (!token) {
    console.error('No token defined. Not able to load data!')
    return false
  }

  return new Now(token)
}
