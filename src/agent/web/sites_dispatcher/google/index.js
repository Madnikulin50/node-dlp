var BaseDispatcher = require('../base.js')

class GoogleDispatcher extends BaseDispatcher {
  static get IS_DISPATCHER () {
    return true
  }

  get service () {
    return 'Google'
  }

  isMine (inPacket) {
    let host = inPacket.host
    if (host.indexOf('google.') === -1) { return false }

    if (inPacket.isLikePost) { return true }

    if (inPacket.isLikeGet) {
      if (inPacket.query.q !== undefined &&
    inPacket.pathName.indexOf('/search') !== -1) { return true }
    }
    return false
  }

  process (inParams, onDone) {
    let packet = inParams.packet
    if (packet.isLikeGet) {
      if (packet.query.q !== undefined) { return super.createSearchCase(inParams, packet.query.q, onDone) }
    }
    return super.process(inParams, onDone)
  }
};

module.exports = GoogleDispatcher
