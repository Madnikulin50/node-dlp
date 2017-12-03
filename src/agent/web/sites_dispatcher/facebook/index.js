var BaseDispatcher = require('../base.js')

class FacebookDispatcher extends BaseDispatcher {
  static get IS_DISPATCHER () {
    return true
  }

  get service () {
    return 'Facebook'
  }
};

module.exports = FacebookDispatcher
