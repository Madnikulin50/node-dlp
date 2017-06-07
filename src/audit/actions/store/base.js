
class Base_Store
{
	constructor(in_Options)
	{
		Object.assign(this, in_Options);
	}

	storeCase(in_Params, in_CB)
	{
		this.prepareForStore(in_Params, (err) => {
			this.doStore(in_Params, (err) => {
				this.finalizeStore(in_Params, in_CB);
			});
		});
	}

	prepareForStore(in_Params, in_CB)
	{
		in_CB(null);
	}

	doStore(in_Params, in_CB)
	{
		in_CB(null);
	}

	finalizeStore(in_Params, in_CB)
	{
		in_CB(null);
	}


};

module.exports = Base_Store;