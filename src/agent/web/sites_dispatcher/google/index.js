var Base_Dispatcher = require('../base.js');

class Google_Dispatcher extends Base_Dispatcher
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
		return 'Google';
	}

	isMine(in_Packet)
	{
		
		let host = in_Packet.host;
		if (host.indexOf('google.') === -1)
			return false;

		if (in_Packet.isLikePost)
			return true;

		if (in_Packet.isLikeGet)
		{
			if (in_Packet.query.q !== undefined &&
				in_Packet.pathName.indexOf('/search') !== -1)
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
		}
		return super.process(in_Params, in_CB);
	}
};

module.exports = Google_Dispatcher;