var Proxy = require('http-mitm-proxy')
var WebAgent = require('../index.js')
var Packet = require('../packet')

class ProxyAgent extends WebAgent {
  constructor (inOptions) {
    super(inOptions)
    this.port = inOptions.port
    this.seqno = 0
  }

  get name () {
    return 'proxy'
  }

  start () {
    super.start()
    console.log('Starting Web proxy at port ' + this.port)

    this.proxy = Proxy()

    this.proxy.onError(function (ctx, err, errorKind) {
      // ctx may be null
      var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : ''
      console.error(errorKind + ' on ' + url + ':', err)
    })

    this.proxy.onRequest((ctx, callback) => {
      let packet = Packet.makeFromProxy({
        incomingMessage: ctx.clientToProxyRequest
      })

      if (this.siteGrabber !== undefined &&
        this.siteGrabber.needGrab(packet)) {
        this.siteGrabber.grab({
          packet: packet,
          agent: this
        }, (err) => {
          if (err) { return callback(err) }
        })
      }

      if (!this.siteDispatcher.isInteresting(packet)) {
        console.log('Ignoring HTTP request ' + packet.method + ' ' + packet.host + packet.url)
        callback()
        return
      }
      console.log('Interesting HTTP request ' + packet.method + ' ' + packet.host + packet.url)

      this.siteDispatcher.process({
        packet: packet,
        agent: this
      }, (err, result) => {
        if (err) { return callback(err) }
        if (result && result.block === true) {
          if (result.blockReason !== undefined) {
            ctx.proxyToClientResponse.end(result.blockReason)
          } else {
            ctx.proxyToClientResponse.end('Blocked by node-dlp')
          }
        }
        callback()
      })
    })

    this.proxy.listen({port: this.port})
    console.log('listening on ' + this.port)
  }
};

module.exports = ProxyAgent
