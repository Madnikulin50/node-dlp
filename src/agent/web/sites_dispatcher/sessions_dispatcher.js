
class Sessions_Dispatcher
{
	constructor()
	{
		this._storage = [];
	}

	pushSession(in_Key, inValue)
	{
		this._storage.push({
			key: in_Key,
			value: inValue 
		});
	}

	findSession(in_Key, onDone)
	{
		let result;
		if (onDone)
			onDone(null, result);
		return result;
	}
};

module.exports = Sessions_Dispatcher;