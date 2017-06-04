const fs = require('fs');

class Site_Dispatcher
{
	constructor(in_Options)
	{
		this.options = in_Options;
		this.loadDispatchers();
	}

	loadDispatchers()
	{
		this.dispatchers = [];
		fs.readdir(__dirname, (err, files) => 
		{
			if (err)
			{
				console.log(err);
				return;
			}
			files.forEach((file) => 
			{
				var cls = require(__dirname + '/'+ file);
				if (cls.IS_DISPATCHER === undefined)
					return;
				this.dispatchers.push(new cls(this));
			});
		});
	}

	isInteresting(in_Packet)
	{
		let method = in_Packet.method;
		let url = in_Packet.url;
		if (method !== 'POST'
			&& method !== 'PUT')
		{
			if (method !== 'GET')
				return false;
			const _interestingGetUrlMasks = 
			[
				's=', 'search=', 'q=', 'bq='
			];
			for (var i in _interestingGetUrlMasks)
			{
				if (url.indexOf(_interestingGetUrlMasks[i]) !== -1)
					return true;
			}
			return false;
		}
		return true;
	
	}
	process(in_Params, in_CB = err => { if (err) throw err; })
	{
		for (let i in this.dispatchers)
		{
			if (this.dispatchers[i].isMine(in_Params.packet))
			{
				return this.dispatchers[i].process(in_Params, in_CB);
			}
		}
	}
}

module.exports = Site_Dispatcher;