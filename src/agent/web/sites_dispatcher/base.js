var Case = require('../../../case'); 
var path = require('path');

class Base_Dispatcher
{
	constructor(in_Options)
	{
		Object.assign(this, in_Options);
	}
	get serviceName()
	{
		return 'unknown';
	}

	isMine(in_Packet)
	{
		return false;
	}

	fillCase(in_Packet, in_Case)
	{
		in_Case.setParams({
			service: this.serviceName,
			date: (new Date()).toUTCString(),
			user: in_Packet.user,
			src_ip: in_Packet.src_ip,
			dst_host: in_Packet.host,
			channel: 'web'
		});
	}

	createCase(in_Params)
	{
		let new_case = new Case();
		new_case.setFolder(path.join(in_Params.agent.audit_fld, new_case.id));
		this.fillCase(in_Params.packet, new_case);
		return new_case;
	}

	finishCase(in_Params, in_CB = (err) => { if (err) throw err; })
	{
		if (in_Params.agent !== undefined)
		{
			return in_Params.agent.makeAudit(in_Params.case, in_CB);
		}
		in_CB("Not set agent reference");
	}

	finishCaseSimple(in_Params, in_Case, in_CB = (err) => { if (err) throw err; })
	{
		let p = Object.assign({}, in_Params);
		p.case = in_Case;
		return this.finishCase(p, in_CB);
	}
	isMine(in_Packet)
	{
		return false;
	}

	processDefaultPost(in_Params, in_CB)
	{

		let cs = this.createCase(in_Params);
		let params = 
		{
			subject: "Default POST logging",
		};
		cs.setParams(params);
		cs.setBody(in_Params.packet, (err) => {
			this.finishCaseSimple(in_Params, cs, in_CB);
		});
	}

	process(in_Params, in_CB)
	{
		let packet = in_Params.packet;
		if (packet.isLikePost)
			return this.processDefaultPost(in_Params, in_CB);
		console.log('Unknown how processv HTTP request ' + packet.method + ' ' + packet.host + packet.url);
		return false;
	}
};

module.exports = Base_Dispatcher;