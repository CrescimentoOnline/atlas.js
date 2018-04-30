import path from 'path'
import Hook from '@atlas.js/hook'
import { WebsocketHook } from '../..'
import * as testmiddleware from './testmiddleware'

describe('Hook: WebsocketHook', () => {
  it('exists', () => {
    expect(WebsocketHook).to.be.a('function')
  })

  it('extends @atlas.js/hook', () => {
    expect(new WebsocketHook()).to.be.instanceof(Hook)
  })

  it('defines its requirements', () => {
    expect(WebsocketHook.requires).to.include('service:koa')
  })

  it('defines its defaults', () => {
    expect(WebsocketHook.defaults).to.have.all.keys([
      'middleware',
      'listen',
    ])
  })

  it('implements `afterPrepare` hook', () => {
    expect(new WebsocketHook()).to.respondTo('afterPrepare')
  })

  it('implements `afterStart` hook', () => {
    expect(new WebsocketHook()).to.respondTo('afterStart')
  })

  it('implements `beforeStop` hook', () => {
    expect(new WebsocketHook()).to.respondTo('beforeStop')
  })


  describe('.afterPrepare()', () => {
    let hook
    let config
    let koa

    beforeEach(() => {
      koa = {
        use: sinon.spy(),
      }
      config = {
        middleware: {
          module: 'testmiddleware',
          config: {},
        },
      }
      hook = new WebsocketHook({
        config,
        atlas: {
          // eslint-disable-next-line global-require
          require: location => require(path.resolve(__dirname, location)),
        },
        log: { debug: () => {} },
        component: () => koa,
      })
    })

    afterEach(() => {
      for (const middleware of Object.values(testmiddleware)) {
        middleware.resetHistory()
      }
    })


    it('extends the koa app with websocket interface', async () => {
      expect(koa).to.not.have.property('ws')
      await hook.afterPrepare()
      expect(koa).to.have.property('ws')
    })

    it('loads all exported middleware from the specified module into Koa', async () => {
      await hook.afterPrepare()

      expect(testmiddleware.first).to.have.callCount(1)
      expect(testmiddleware.second).to.have.callCount(1)
    })

    it('passes the provided middleware config to the middleware', async () => {
      config.middleware.config = {
        first: { firsttest: true },
        second: { secondtest: true },
      }

      await hook.afterPrepare()

      const args = {
        first: testmiddleware.first.lastCall.args[0],
        second: testmiddleware.second.lastCall.args[0],
      }

      expect(args.first).to.eql({ firsttest: true })
      expect(args.second).to.eql({ secondtest: true })
    })
  })


  describe('.afterStart()', () => {
    let hook
    let koa
    let config

    beforeEach(() => {
      config = {
        listen: {
          test: true,
        },
      }
      koa = {
        server: { address: sinon.stub() },
        ws: { listen: sinon.spy() },
      }
      hook = new WebsocketHook({
        config,
        atlas: {},
        log: { info: () => {} },
        component: () => koa,
      })
    })


    it('calls .listen() on the koa.ws instance', async () => {
      expect(koa.ws.listen).to.have.callCount(0)
      await hook.afterStart()
      expect(koa.ws.listen).to.have.callCount(1)

      const args = koa.ws.listen.lastCall.args

      expect(args[0]).to.have.property('server', koa.server)
      expect(args[0]).to.have.property('test', true)
    })
  })


  describe('.beforeStop()', () => {
    let hook
    let koa

    beforeEach(() => {
      koa = {
        ws: {
          server: { close: sinon.stub().callsArgWithAsync(0, null) },
        },
      }
      hook = new WebsocketHook({
        atlas: {},
        log: { info: () => {} },
        component: () => koa,
      })
    })
    it('calls .close() on the koa.ws.server instance', async () => {
      expect(koa.ws.server.close).to.have.callCount(0)
      await hook.beforeStop()
      expect(koa.ws.server.close).to.have.callCount(1)
    })
  })
})
