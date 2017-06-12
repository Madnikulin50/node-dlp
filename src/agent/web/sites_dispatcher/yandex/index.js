var Base_Dispatcher = require('../base.js');

class Yandex_Dispatcher extends Base_Dispatcher
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

	process(in_Params, in_CB)
	{
		let packet = in_Params.packet;
		if (packet.isLikeGet)
		{
			if (packet.query.text !== undefined)
				return super.createSearchCase(in_Params, packet.query.text, in_CB);
		}
		return super.process(in_Params, in_CB);
	}

};

module.exports = Yandex_Dispatcher;