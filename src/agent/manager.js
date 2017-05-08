var fs = require('fs');

class Agent_Manager
{
    constructor(in_Options)
    {
        this.agents = [];
        let agent_opts = in_Options.agents;
		if (!fs.existsSync(agent_opts.common.tmp_fld))
			fs.mkdir(agent_opts.common.tmp_fld);
		if (!fs.existsSync(agent_opts.common.audit_fld))
			fs.mkdir(agent_opts.common.audit_fld);
        for (let ind in agent_opts.agents)
        {
            let agent_opt = Object.assign({}, agent_opts.agents[ind]);
			agent_opt = Object.assign(agent_opt, agent_opts.common);
            let agent_class = require(__dirname + '/' + agent_opt.type);
            let agent = new agent_class(agent_opt);
            this.agents.push(agent);
        }
        this.agents.forEach((agent)=>agent.start({}))
    }

};

module.exports = Agent_Manager;