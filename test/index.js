import test from 'ava'
import {Application} from 'spectron'

test.beforeEach(async t => {
  t.context.app = new Application({
    path: '../dist/mac/Now.app/Contents/MacOS/Now'
  })

  await t.context.app.start()
})

test.afterEach.always(async t => {
  await t.context.app.stop()
})

test(async t => {
  const app = t.context.app
  await app.client.waitUntilWindowLoaded()

  t.is(await app.client.getWindowCount(), 4)
})
