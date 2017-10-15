var audit = require('../audit');

class Agent {
  constructor(inOptions) {
    Object.assign(this, inOptions);
  }

  get name() {
    return 'unknown';
  }

  start(inParams, onDone) {

  }

  stop(inParams, onDone) {

  }
  makeAudit(in_Case, onDone) {
    return audit.get().execute({
      case: in_Case
    }, onDone);
  }

  static createAgentManager(inOptions) {
    var Agent_Manager = require('./manager.js');
    return new Agent_Manager(inOptions);
  }


}

module.exports = Agent;