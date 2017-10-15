const fs = require('fs')
const path = require('path')

class AgentManager {
  constructor (inOptions) {
    let agentOpts = inOptions.agents
    if (!fs.existsSync(agentOpts.common.tmp_fld)) { fs.mkdir(agentOpts.common.tmp_fld) }

    if (!fs.existsSync(agentOpts.common.audit_fld)) { fs.mkdir(agentOpts.common.audit_fld) }

    this.agents = agentOpts.agents.map((agentDef) => {
      let agentOpt = Object.assign({}, agentDef, agentOpts.common)
      let AgentClass = require(path.join(__dirname, agentOpt.type))
      return new AgentClass(agentOpt)
    })
    this.agents.forEach((agent) => agent.start({}))
  }
}

module.exports = AgentManager
