var Base_Dispatcher = require('../base.js');

class Common_Dispatcher extends Base_Dispatcher
{
	static get IS_DISPATCHER() {
		return true;
	}

	get priority() {
		return 255;
	}

	constructor(in_Options)
	{
		super(in_Options);
	}


	get service()
	{
		return 'Common';
	}

	isMine(in_Packet)
	{
		if (in_Packet.isLikePost)
			return true;
		if (in_Packet.isLikeGet)
		{
			let url = in_Packet.url;
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
		return false;
	}

};

module.exports = Common_Dispatcher;