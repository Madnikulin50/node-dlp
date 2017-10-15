var BaseCondition = require('./base')
var creator = require('./index.js')

class NotCondition extends BaseCondition {
  constructor (inOptions, onDone) {
    super(inOptions, onDone)
    creator(inOptions.condition, (err, result) => {
      if (err) { return onDone(err) }
      this.condition = result
      onDone(null, this)
    })
  }

  isSatisfied (inEnv, onDone) {
    return this.condition.isSatisfied(inEnv, (err, result) => {
      if (err) { return onDone(err, result) }
      return onDone(err, !result)
    })
  }

  executeOnDB () {

  }
};

module.exports = NotCondition
