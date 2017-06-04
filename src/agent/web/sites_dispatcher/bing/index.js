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

	isMine(in_Packet)
	{
		let host = in_Packet.host;
		if (host.indexOf('.bing.') === -1)
			return false;
		if (in_Packet.isLikePost)
			return true;
		
		if (in_Packet.isLikeGet)
		{
			if (in_Packet.query.q !== undefined &&
				in_Packet.pathName === '/search')
				return true;
			if (in_Packet.query.bq !== undefined)
				return true;
		}
		return false;
	}

	process(in_Params, in_CB)
	{
		let packet = in_Params.packet;
		if (packet.isLikeGet)
		{
			if (packet.query.q !== undefined
			|| packet.query.bq !== undefined)
			{
				let query = packet.query.q;
				if (query === undefined)
					query = packet.query.bq;

				let cs = this.createCase(in_Params);
				let params =
				{
					subject: packet.query.bq === undefined ? "Search" : "Fast search",
				};
				cs.setParams(params);
				cs.setBody(query, err => {
					this.finishCaseSimple(in_Params, cs, in_CB);
				});
				return;
			}
		}
		return super.process(in_Params, in_CB);
	}
};

module.exports = Bing_Dispatcher;

