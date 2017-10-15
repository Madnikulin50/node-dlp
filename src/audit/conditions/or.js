var ComplexCondition = require('./complex_condition.js')
var async = require('async')

class OrCondition extends ComplexCondition {
  isSatisfied (inEnv, onDone) {
    var counter = 0
    async.each(this.condions, (condition, conditionDone) => {
      condition.isSatisfied(inEnv, (err, result) => {
        if (result) { counter++ }
        conditionDone(err)
      })
    },
    (err) => {
      onDone(err, counter > 0)
    })
  }

  executeOnDB () {

  }
};

module.exports = OrCondition
