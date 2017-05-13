var path = require("path");

class Action
{
	constructor(in_Action_Options)
	{
		Object.assign(this, in_Action_Options);
		return this;
	}

	isSatisfying(in_Case)
	{
		if (this.rule !== undefined)
		{
			for (let rule of this.rule)
            {
				if (in_Case.isRulePresent(this.rule[rule]))
					return true;
			}
			return false;
		}
		return true;
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