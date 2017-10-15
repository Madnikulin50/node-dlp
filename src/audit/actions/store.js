var AfterAllAction = require('./after-all.js')
var Options = require('../../options')
var storeLoader = require('../../store')

class StoreAction extends AfterAllAction {
  constructor (inOptions) {
    super(inOptions)
    var options = new Options()

    let active = options.store.active
    let activeOpts = options.store[active]

    storeLoader(activeOpts, (err, result) => {
      if (err) { throw err }
      this._store = result
    })
    return this
  }
  doAfterAll (inEnv, onDone) {
    return this._store.doStore(inEnv, onDone)
  }
};

module.exports = StoreAction
