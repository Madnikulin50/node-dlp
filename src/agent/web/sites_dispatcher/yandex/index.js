var BaseDispatcher = require('../base.js')

class YandexDispatcher extends BaseDispatcher {
  static get IS_DISPATCHER () {
    return true
  }

  get service () {
    return 'Yandex'
  }

  isMine (inPacket) {
    let host = inPacket.host
    if (host.indexOf('yandex.ru') === -1) { return false }

    if (inPacket.isLikePost) { return true }

    if (inPacket.isLikeGet) {
      if (inPacket.query.q !== undefined &&
    inPacket.pathName === '/search/') { return true }
      if (inPacket.query.text !== undefined) { return true }
    }
    return false
  }

  process (inParams, onDone) {
    let packet = inParams.packet
    if (packet.isLikeGet) {
      if (packet.query.text !== undefined) { return super.createSearchCase(inParams, packet.query.text, onDone) }
    }
    return super.process(inParams, onDone)
  }
};

module.exports = YandexDispatcher
