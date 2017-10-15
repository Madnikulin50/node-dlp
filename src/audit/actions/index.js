var path = require('path')
var async = require('async')

class Action {
  constructor (inOptions) {
    Object.assign(this, inOptions)

    if (this.policy !== undefined) { this.loadPolicies() }
    return this
  }

  loadPolicies () {
    let polOpts

    if (Array.isArray(this.policy)) { polOpts = this.policy } else { polOpts = [this.policy] }
    this.policy = []
    polOpts.forEach((policyName) => {
      this.policy.push(this.audit.findPolicy(policyName))
    })
  }

  isSatisfying (inEnv, onDone) {
    if (this.active === false) { return onDone(null, false) }
    if (this.policy === undefined) { return onDone(null, true) }
    var counter = 0
    async.each(this.policy, (pol, callback) => {
      pol.isSatisfied(inEnv, (err, result) => {
        if (result) { counter++ }
        callback(err, result)
      })
    }, (err) => {
      onDone(err, counter > 0)
    })
  }

  do (inCase, onDone) {
    console.log('Executed ' + this.type + ' action ' + (this.name !== undefined ? this.name : '(noname)'))
    var result = {block: false}
    if (onDone) { onDone(null, result) }
    return result
  }

  static loadActions (inOptions) {
    let actions = []
    inOptions.agents.forEach((element) => {
      let Class = require(path.join(__dirname, element.type + '.js'))
      actions.push(new Class(element, inOptions))
    })
    return actions
  }
};

module.exports = Action
