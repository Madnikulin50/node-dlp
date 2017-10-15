var ComplexCondition = require('./complex_condition.js')
const async = require('async')
class AndCondition extends ComplexCondition {
  isSatisfied (inEnv, onDone) {
    var counter = 0
    async.each(this.condions, (condition, conditionDone) => {
      condition.isSatisfied(inEnv, (err, result) => {
        if (result) { counter++ }
        return conditionDone(err)
      })
    },
    (err) => {
      return onDone(err, counter === this.condions.length)
    })
  }

  executeOnDB () {

  }
};

module.exports = AndCondition
