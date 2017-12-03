
class SessionsDispatcher {
  constructor () {
    this._storage = []
  }

  pushSession (inKey, inValue) {
    this._storage.push({
      key: inKey,
      value: inValue
    })
  }

  findSession (inKey, onDone) {
    let result
    if (onDone) { onDone(null, result) }
    return result
  }
};

module.exports = SessionsDispatcher
