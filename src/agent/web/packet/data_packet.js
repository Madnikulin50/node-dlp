var BasePacket = require('./base.js')
var url = require('url')
var uaParser = require('ua-parser')

class DataPacket extends BasePacket {
  constructor (inObject) {
    super(inObject)
    this._data = inObject
    this.isFull = true
  }

  get isMainRequest () {
    return this._data.incomingMessage.headers['referer'] === undefined
  }

  get method () {
    return this._data.incomingMessage.method
  }
  get host () {
    return this._data.incomingMessage.headers.Host || this._data.incomingMessage.headers.host
  }
  get protocol () {
    return 'http'
  }
  get fullPath () {
    return this.protocol + '://' + this.host + this.url
  }

  get srcIp () {
    let addr = this._data.incomingMessage.connection.remoteAddress
    if (addr !== undefined) { return addr }
    addr = this._data.incomingMessage.headers['x-forwarded-for']
    if (addr !== undefined) { return addr }
    return '127.0.0.1'
  }

  get pathName () {
    if (this._pathName === undefined) {
      this.prepareUrl()
    }
    return this._pathName
  }

  get url () {
    return this._data.incomingMessage.url || this._data.incomingMessage.uri || '/'
  }

  get query () {
    if (this._query === undefined) {
      this.prepareUrl()
    }
    return this._query
  }
  prepareUrl () {
    var urlParts = url.parse(this.url, true)
    this._query = urlParts.query
    this._pathName = urlParts.pathname
  }

  get isLikeGet () {
    return this.method === 'GET'
  }

  get isLikePost () {
    return this.method === 'POST' ||
   this.method === 'PUT'
  }

  get userAgent () {
    return uaParser.parse(this._data.incomingMessage.headers['user-agent'])
  }
};

module.exports = DataPacket
