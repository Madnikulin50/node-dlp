var Base_Store = require('./base');

class Postgres_Store extends Base_Store
{
	constructor(in_Options)
	{
		super(in_Options);
	}

	

	doStore(in_Params, in_CB)
	{
		in_CB(null);
	}
};

module.exports = Postgres_Store;