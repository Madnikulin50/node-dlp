var audit = require('../audit');

class Agent
{
    constructor(in_Options)
    {
		Object.assign(this, in_Options);
    }
	
	get name() {
		return 'unknown';
	}

    start(in_Params, in_Callback)
    {

    }

    stop(in_Params, in_Callback)
    {

    }
	makeAudit(in_Case, in_Callback)
	{
		return audit.get().execute({
			case: in_Case
		}, in_Callback);
	}
    
    static createAgentManager(in_Options)
    {
        var Agent_Manager = require('./manager.js'); 
        return new Agent_Manager(in_Options);
    }
	
	
};

module.exports = Agent;