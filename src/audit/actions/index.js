var path = require("path");
var async = require("async");

class Action
{
	constructor(in_Action_Options)
	{
		Object.assign(this, in_Action_Options);
		
		if (this.policy !== undefined)
			this.loadPolicies();
		return this;
	}

	loadPolicies()
	{
		let pol_opts;
		
		if (Array.isArray(this.policy))
			pol_opts = this.policy;
		else
			pol_opts = [this.policy];
		this.policy = [];
		pol_opts.forEach((policyName) => {
			this.policy.push(this.audit.findPolicy(policyName));
		});
	}

	isSatisfying(in_Env, in_Cb)
	{
		if (this.active === false)
			return in_Cb(null, false);
		if (this.policy === undefined)
			return in_Cb(null, true);
		var counter = 0;
		async.each(this.policy, (pol, callback) => {
			pol.isSatisfied(in_Env, (err, result) => {
				if (result)
					counter++;
				callback(err, result);
			});
		}, (err) => {
			in_Cb(err, counter > 0);
		})
	}

	do(in_Case, in_Callback)
	{
		console.log("Executed " + this.type + " action " + (this.name !== undefined ? this.name : "(noname)"));
		var result = {block:false};
		if (in_Callback)
			in_Callback(null, result);
		return result;
	}

	static loadActions(in_Options)
	{
		let actions = [];
		in_Options.agents.forEach((element)=>
		{
			let new_agent_class = require(path.join(__dirname, element.type + ".js"));
			let new_agent = new new_agent_class(element, in_Options);
			agents.push(new_agent);
		});
		return agents;
	}
};

module.exports = Action;