var conditionsCreator = require('./conditions')
var async = require('async')

class Policy {
  load (inOptions, onDone) {
    Object.assign(this, inOptions)
    this.name = inOptions.name
    this.conditions = []

    if (inOptions.condition === undefined) {
      return onDone(null, this)
    }
    let conditions
    if (!Array.isArray(inOptions.condition)) { conditions = [ inOptions.condition ] } else { conditions = inOptions.condition }

    async.each(conditions, (condition, callback) => {
      conditionsCreator(condition, (err, result) => {
        if (err) { return callback(err) }
        this.conditions.push(result)
        callback(err)
      })
    },
    (err) => {
      onDone(err, this)
    })
  }

  isSatisfied (inEnv, onDone) {
    if (this.condition === null) { return onDone(null, true) }
    let counter = 0
    async.each(this.conditions, (condition, conditionDone) => {
      condition.isSatisfied(inEnv, (err, result) => {
        if (result === true) { counter++ }
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

module.exports = function (inOptions, onDone) {
  let policy = new Policy()
  return policy.load(inOptions, onDone)
}
