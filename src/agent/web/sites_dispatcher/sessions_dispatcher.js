
class Sessions_Dispatcher
{
	constructor()
	{
		this._storage = [];
	}

	pushSession(in_Key, in_Value)
	{
		this._storage.push({
			key: in_Key,
			value: in_Value 
		});
	}

	findSession(in_Key, in_CB)
	{
		let result;
		if (in_CB)
			in_CB(null, result);
		return result;
	}
};

module.exports = Sessions_Dispatcher;