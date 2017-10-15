var Base_Dispatcher = require('../base.js');

class Yandex_Dispatcher extends Base_Dispatcher
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
		return 'Yandex';
	}

	isMine(in_Packet)
	{
		
		let host = in_Packet.host;
		if (host.indexOf('yandex.ru') === -1)
			return false;

		if (in_Packet.isLikePost)
			return true;

		if (in_Packet.isLikeGet)
		{
			if (in_Packet.query.q !== undefined &&
				in_Packet.pathName === '/search/')
				return true;
			if (in_Packet.query.text !== undefined)
				return true;
		}
		return false;
	}

	process(inParams, onDone)
	{
		let packet = inParams.packet;
		if (packet.isLikeGet)
		{
			if (packet.query.text !== undefined)
				return super.createSearchCase(inParams, packet.query.text, onDone);
		}
		return super.process(inParams, onDone);
	}

};

module.exports = Yandex_Dispatcher;