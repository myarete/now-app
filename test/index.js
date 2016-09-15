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

test('check window count', async t => {
  const app = t.context.app
  await app.client.waitUntilWindowLoaded()

  t.is(await app.client.getWindowCount(), 4)
})

test('see if dev tools are open', async t => {
  const app = t.context.app
  await app.client.waitUntilWindowLoaded()

  t.false(await app.browserWindow.isDevToolsOpened())
})
