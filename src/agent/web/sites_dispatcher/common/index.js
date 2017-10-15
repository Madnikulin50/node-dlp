var BaseDispatcher = require('../base.js')

class CommonDispatcher extends BaseDispatcher {
  static get IS_DISPATCHER () {
    return true
  }

  get priority () {
    return 255
  }

  get service () {
    return 'Common'
  }

  isMine (inPacket) {
    if (inPacket.isLikePost) { return true }
    if (inPacket.isLikeGet) {
      let url = inPacket.url
      const _interestingGetUrlMasks =
   [
     's=', 'search=', 'q=', 'bq='
   ]
      for (var i in _interestingGetUrlMasks) {
        if (url.indexOf(_interestingGetUrlMasks[i]) !== -1) { return true }
      }
      return false
    }
    return false
  }
};

module.exports = CommonDispatcher
