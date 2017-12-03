
class BaseStoreDispatcher {
  constructor (inOptions) {
    Object.assign(this, inOptions)
  }

  start (inParams, onDone) {
    onDone(null, this)
  }
};

module.exports = BaseStoreDispatcher
