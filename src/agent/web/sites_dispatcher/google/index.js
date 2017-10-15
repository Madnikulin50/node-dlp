var Base_Dispatcher = require('../base.js');

class Google_Dispatcher extends Base_Dispatcher
{
	static get IS_DISPATCHER() {
		return true;
	}

	constructor(inOptions)
	{
		super(inOptions);
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

	process(inParams, onDone)
	{
		let packet = inParams.packet;
		if (packet.isLikeGet)
		{
			if (packet.query.q !== undefined)
				return super.createSearchCase(inParams, packet.query.q, onDone);
		}
		return super.process(inParams, onDone);
	}
};

module.exports = Google_Dispatcher;