var NotifyAction = require('./notify.js')

class EMailAction extends NotifyAction {
  doAfterAll (inCase, onDone) {
    return super.doAfterAll(inCase, onDone)
  }
};

module.exports = EMailAction
