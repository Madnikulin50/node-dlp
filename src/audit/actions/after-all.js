var Action = require('./index.js');

class After_All_Action extends Action
{
	constructor(in_Action_Options)
	{
		super(in_Action_Options);
	}

	do(in_Env, in_Callback)
	{
		this.isSatisfying(in_Env, (err, result) =>
		{
			if (result)
				in_Env.afterAllActions.push(this);
			in_Callback(err, result);
		})
	}

	doAfterAll(in_Env, in_Callback)
	{
		in_Callback(null);
	}
};

module.exports = After_All_Action;