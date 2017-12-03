var BaseCondition = require('./base.js')
var creator = require('./index.js')
var async = require('async')

class ComplexCondition extends BaseCondition {
  constructor (inOptions, onDone) {
    super(inOptions, (err) => {
      if (err) { return onDone(err) }
      this.conditions = []
      if (inOptions.conditions) {
        async.each(inOptions.conditions, (condition, conditionDone) => {
          creator(condition, (err, result) => {
            if (err) { return conditionDone(err) }
            this.conditions.push(result)
            return conditionDone()
          })
        },
        (err) => {
          return onDone(err, this)
        })
      }
    })
  }

  isSatisfied (inEnv) {
    return true
  }

  executeOnDB () {

  }
};

module.exports = ComplexCondition
