var audit = require('../audit')

class Agent {
  constructor (inOptions) {
    Object.assign(this, inOptions)
  }

  get name () {
    return 'unknown'
  }

  start (inParams, onDone) {

  }

  stop (inParams, onDone) {

  }
  makeAudit (inCase, onDone) {
    return audit.get().execute({
      case: inCase
    }, onDone)
  }

  static createAgentManager (inOptions) {
    const AgentManager = require('./manager.js')
    return new AgentManager(inOptions)
  }
}

module.exports = Agent
