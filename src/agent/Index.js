

class Agent
{
    constructor(in_Options)
    {
		Object.assign(this, in_Options);
    }

    start(in_Params, in_Callback)
    {

    }

    stop(in_Params, in_Callback)
    {

    }
	makeAudit(in_Case, in_Callback)
	{
		
		var audit = require('../audit').get();
		return audit.execute(in_Case);
	}
    
    static createAgentManager(in_Options)
    {
        var Agent_Manager = require('./manager.js'); 
        return new Agent_Manager(in_Options);
    }
	
	
};

module.exports = Agent;