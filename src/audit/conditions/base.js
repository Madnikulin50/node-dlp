
class BaseCondition {
  constructor (inOptions, onDone) {
    Object.assign(this, inOptions)
  }

  isSatisfied (inEnv, onDone) {
    return onDone(null, true)
  }

  executeOnDB () {

  }
};

module.exports = BaseCondition
