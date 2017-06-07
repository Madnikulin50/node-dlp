var Base_Dispatcher = require('../base.js');

class Bing_Dispatcher extends Base_Dispatcher
{

	static get IS_DISPATCHER() {
		return true;
	}

	constructor(in_Options)
	{
		super(in_Options);
	}

	get service()
	{
		return 'Bing';
	}

	isMine(in_Packet)
	{
		let host = in_Packet.host;
		if (host.indexOf('.bing.') === -1)
			return false;
		if (in_Packet.isLikePost)
			return true;
		
		if (in_Packet.isLikeGet)
		{
			if (in_Packet.pathName === '/search' &&
				(in_Packet.query.q !== undefined ||
				in_Packet.query.bq !== undefined))
				return true;
		}
		return false;
	}

	process(in_Params, in_CB)
	{
		let packet = in_Params.packet;
		if (packet.isLikeGet)
		{
			if (packet.query.q !== undefined)
				return super.createSearchCase(in_Params, packet.query.q, in_CB);
			if (packet.query.bq !== undefined)
				return super.createSearchCase(in_Params, packet.query.bq, in_CB);
		}
		return super.process(in_Params, in_CB);
	}
};

module.exports = Bing_Dispatcher;

