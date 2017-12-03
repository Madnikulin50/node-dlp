var BaseCondition = require('./base.js')

class ContainCondition extends BaseCondition {
  constructor (inOptions, onDone) {
    super(inOptions, onDone)
    this.mask = inOptions.mask
    this.field = inOptions.field
    onDone(null, this)
  }

  isSatisfied (inEnv, onDone) {
    for (let field of this.field) {
      let fieldValue = inEnv.case.getField(field)
      if (fieldValue === undefined) { continue }

      for (let mask of this.mask) {
        let regex = new RegExp(mask)
        if (fieldValue.search(regex) !== -1) {
          return onDone(null, true)
        }
      }
    }
    return onDone(null, false)
  }
}

module.exports = ContainCondition
