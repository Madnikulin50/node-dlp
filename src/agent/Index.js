

class Agent
{
    constructor(in_Options)
    {

    }

    start(in_Params, in_Callback)
    {

    }

    stop(in_Params, in_Callback)
    {

    }
    
    static createAgentManager(in_Options)
    {
        var Agent_Manager = require('./manager.js'); 
        return new Agent_Manager(in_Options);
    }
};

module.exports = Agent;