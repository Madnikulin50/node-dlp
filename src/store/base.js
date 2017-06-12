
class Base_Store_Dispatcher
{
	constructor(in_Options)
	{
		Object.assign(this, in_Options);
	}

	start(in_Params, in_CB)
	{
		in_CB(null, this);
	}

};

module.exports = Base_Store_Dispatcher;