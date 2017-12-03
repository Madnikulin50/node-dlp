const WebAgent = require('../index.js')
const Packet = require('../packet')
const ICAPServer = require('nodecap2').ICAPServer
// const DomainList = require('nodecap2').DomainList

class IcapAgent extends WebAgent {
  constructor (inOptions) {
    super(inOptions)
    this.port = inOptions.port
    this.seqno = 0
  }

  get name () {
    return 'icap'
  }

  _installOptions () {
    //  configure options
    //    to have different options for requests and responses,
    //    configure squid to send these to different ICAP resource paths
    //  REQMOD
    this.server.options('/request', (icapReq, icapRes, next) => {
      icapRes.setIcapStatusCode(200)
      icapRes.setIcapHeaders({
        'Methods': 'REQMOD',
        'Preview': 10 * 1024 * 1024
      })
      icapRes.writeHeaders(false)
      icapRes.end()
    })
    //  RESPMOD
    this.server.options('/response', (icapReq, icapRes, next) => {
      icapRes.setIcapStatusCode(200)
      icapRes.setIcapHeaders({
        'Methods': 'RESPMOD',
        'Preview': 10 * 1024 * 1024,
        'Transfer-Preview': '*',
        'Transfer-Ignore': 'jpg,jpeg,gif,png',
        'Transfer-Complete': '',
        'Max-Connections': '100'
      })
      icapRes.writeHeaders(false)
      icapRes.end()
    })

    //  return error if options path not recognized
    this.server.options('*', (icapReq, icapRes, next) => {
      if (!icapRes.done) {
        icapRes.setIcapStatusCode(404)
        icapRes.writeHeaders(false)
        icapRes.end()
        return
      }
      next()
    })
  }

  //  helper to accept a request/response
  acceptRequest (icapReq, icapRes, req, res) {
    if (!icapRes.hasFilter() && icapReq.hasPreview()) {
      icapRes.allowUnchanged()
      return
    }
    // only example how are presented multiple headers in request
    req.headers['X-Example'] = ['flag{12345-FirstHeader}', 'second header']
    // Response will contain two different header:
    // X-Example: flag{12345-FirstHeader}
    // X-Example: second header

    icapRes.setIcapStatusCode(200)
    icapRes.setIcapHeaders(icapReq.headers)
    if (icapReq.isReqMod()) {
      icapRes.setHttpMethod(req)
      icapRes.setHttpHeaders(req.headers)
    } else {
      icapRes.setHttpStatus(res.code)
      icapRes.setHttpHeaders(res.headers)
    }
    const hasBody = icapReq.hasBody()
    if (hasBody) {
      icapRes.continuePreview()
    }
    icapRes.writeHeaders(hasBody)
    icapReq.pipe(icapRes)
  }

  //  helper to reject a request/response
  rejectRequest (icapReq, icapRes, req, res) {
    let hasBody = false
    const errorPage = 'page blocked'
    const headers = {}
    // do *not* set Content-Length: causes an issue with Squid
    if (req.headers && 'Accept' in req.headers && req.headers['Accept'].indexOf('text') >= 0) {
      hasBody = true
      headers['Content-Type'] = 'text/html; charset=UTF-8'
    }

    icapRes.setIcapStatusCode(200)
    icapRes.setIcapHeaders(icapReq.headers)
    icapRes.setHttpStatus(403)
    icapRes.setHttpHeaders(headers)
    if (hasBody) {
      icapRes.writeHeaders(true)
      // only one calling at once.
      icapRes.send(errorPage)
    } else {
      icapRes.writeHeaders(false)
    }
    // WARNING: don't forget to write.end() after .send()
    // or your data will not send.:(
    icapRes.end()
  }
  createIncidentByReq (inReq, onDone) {
    let packet = Packet.makeFromProxy({
      incomingMessage: inReq
    })

    if (!this.siteDispatcher.isInteresting(packet)) {
      console.log('Ignoring HTTP request ' + packet.method + ' ' + packet.host + packet.url)
      onDone()
      return
    }
    console.log('Interesting HTTP request ' + packet.method + ' ' + packet.host + packet.url)

    this.siteDispatcher.process({
      packet: packet,
      agent: this
    }, (err, result) => {
      if (err) { return onDone(err) }
      onDone()
    })
  }
  controlRequest (icapReq, icapRes, req, res) {
    if (!icapRes.hasFilter() && icapReq.hasPreview()) {
      icapRes.allowUnchanged()
      return
    }
    icapRes.setIcapStatusCode(200)
    icapRes.setIcapHeaders(icapReq.headers)
    if (icapReq.isReqMod()) {
      icapRes.setHttpMethod(req)
      icapRes.setHttpHeaders(req.headers)
    } else {
      icapRes.setHttpStatus(res.code) // or icapRes.setHttpStatus(res);
      icapRes.setHttpHeaders(res.headers)
    }
    const hasBody = icapReq.hasBody()
    if (hasBody && !icapReq.ieof) {
      icapRes.continuePreview()
    }
    icapRes.writeHeaders(hasBody)

    this.createIncidentByReq(req, (err) => {
      if (err) console.log(err)
    })

    // .pipe() or .end() must be called.
    icapReq.pipe(icapRes)
  }
  controlResponse (icapReq, icapRes, req, res) {
    if (!icapRes.hasFilter() && icapReq.hasPreview()) {
      icapRes.allowUnchanged()
      return
    }
    icapRes.setIcapStatusCode(200)
    icapRes.setIcapHeaders(icapReq.headers)
    if (icapReq.isReqMod()) {
      icapRes.setHttpMethod(req)
      icapRes.setHttpHeaders(req.headers)
    } else {
      icapRes.setHttpStatus(res.code) // or icapRes.setHttpStatus(res);
      icapRes.setHttpHeaders(res.headers)
    }
    const hasBody = icapReq.hasBody()
    if (hasBody && !icapReq.ieof) {
      icapRes.continuePreview()
    }
    icapRes.writeHeaders(hasBody)
    // .pipe() or .end() must be called.
    icapReq.pipe(icapRes)
  }

  _installReqRespMode () {
    /* const whitelist = new DomainList()
    whitelist.addMany([
      'whitelisted.example.com', // match fixed domain
      '.whitelisted.example.net' // match fixed domain and all subdomains
    ])
    this.server.request(whitelist, this.acceptRequest.bind(this))
    this.server.response(whitelist, this.acceptRequest.bind(this))

    //  reject otherwise
    this.server.request('*', this.rejectRequest.bind(this))
    this.server.response('*', this.rejectRequest.bind(this)) */

    this.server.request('*', this.controlRequest.bind(this))
    this.server.response('*', this.controlResponse.bind(this))
  }

  _installErrorHandling () {
    this.server.error((err, icapReq, icapRes, next) => {
      console.error(err)
      if (!icapRes.done) {
        icapRes.setIcapStatusCode(500)
        icapRes.writeHeaders(false)
        icapRes.end()
      }
      next()
    })
  }

  _installCallbacks () {
    this._installOptions()
    this._installReqRespMode()
    this._installErrorHandling()
  }

  start () {
    super.start()
    console.log('Starting ICAP proxy at port ' + this.port)

    this.server = new ICAPServer({
      debug: false
    })

    console.log('Starting ICAP server...')
    this.server.listen((port) => {
      console.log(`ICAP server listening on port ${port}`)
    })
    this._installCallbacks()
    /* 
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

    this.proxy.listen({port: this.port}) */
    console.log('listening on ' + this.port)
  }
};

module.exports = IcapAgent
