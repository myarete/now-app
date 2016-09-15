import test from 'ava'
import {Application} from 'spectron'

test.beforeEach(t => {
  t.context.app = new Application({
    path: '../dist/mac/Now.app/Contents/MacOS/Now'
  })

  return t.context.app.start()
})

test.afterEach(t => {
  return t.context.app.stop()
})

test(t => {
  return t.context.app.client.waitUntilWindowLoaded()
    .getWindowCount().then(count => {
      t.is(count, 4)
    })
})
