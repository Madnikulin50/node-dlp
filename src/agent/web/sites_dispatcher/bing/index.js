var BaseDispatcher = require('../base.js')

class BingDispatcher extends BaseDispatcher {
  static get IS_DISPATCHER () {
    return true
  }

  get service () {
    return 'Bing'
  }

  isMine (inPacket) {
    let host = inPacket.host
    if (host.indexOf('.bing.') === -1) { return false }
    if (inPacket.isLikePost) { return true }

    if (inPacket.isLikeGet) {
      if (inPacket.pathName === '/search' &&
    (inPacket.query.q !== undefined ||
    inPacket.query.bq !== undefined)) { return true }
    }
    return false
  }

  process (inParams, onDone) {
    let packet = inParams.packet
    if (packet.isLikeGet) {
      if (packet.query.q !== undefined) { return super.createSearchCase(inParams, packet.query.q, onDone) }
      if (packet.query.bq !== undefined) { return super.createSearchCase(inParams, packet.query.bq, onDone) }
    }
    return super.process(inParams, onDone)
  }
};

module.exports = BingDispatcher
