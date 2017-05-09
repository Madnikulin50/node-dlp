
let instance = null;

class Audit
{
    constructor(in_Options)
    {
		if (instance)
			return instance;
		instance = this;
		if (in_Options)
			instance.loadOptions(in_Options);
	
		return instance;
    }
	static get()
	{
		return instance;
	}

	loadOptions(in_Options)
	{
		Object.assign(instance, in_Options);
		this.action = [];
		let agent_opts = in_Options.agents;
	}

    execute(in_Case)
    {

    }

    executeOnDB()
    {
        
    }

};

module.exports = Audit;