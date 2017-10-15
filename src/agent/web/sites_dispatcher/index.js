const fs = require('fs');

class Site_Dispatcher
{
	constructor(inOptions)
	{
		this.options = inOptions;
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

			this.dispatchers.sort((a, b) => {
				return a.priority - b.priority;
			});
		});
	}

	isInteresting(in_Packet)
	{
		if (in_Packet.isLikePost)
			return true;
		
		if (!in_Packet.isLikeGet)
			return false;
		
		for (let i in this.dispatchers)
		{
			if (this.dispatchers[i].isMine(in_Packet))
				return true;
		}
		return false;
	
	}
	process(inParams, onDone = err => { if (err) throw err; })
	{
		for (let i in this.dispatchers)
		{
			if (this.dispatchers[i].isMine(inParams.packet))
			{
				return this.dispatchers[i].process(inParams, onDone);
			}
		}
		return onDone(null, null);
	}
}

module.exports = Site_Dispatcher;