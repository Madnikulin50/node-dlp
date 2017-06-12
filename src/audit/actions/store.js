var After_All_Action = require('./after-all.js');
var Options = require('../../options');
var store_loader  = require('../../store');

class Store_Action extends After_All_Action
{
	constructor(in_Action_Options)
	{
		super(in_Action_Options);
		var options = new Options();


		let active = options.store.active;
		let active_opts = options.store[active];

		store_loader(active_opts, (err, result) => {
			if (err)
				throw err;
			this._store = result;
		});
		return this;
	}
	doAfterAll(in_Env, in_Callback)
	{
		return this._store.doStore(in_Env, in_Callback);
	}

	
};

module.exports = Store_Action;