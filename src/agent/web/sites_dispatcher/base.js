var Case = require('../../../case'); 
var path = require('path');

class Base_Dispatcher
{
	constructor(inOptions)
	{
		Object.assign(this, inOptions);
	}

	get priority() {
		return 127;
	}

	get service()
	{
		return 'unknown';
	}

	isMine(in_Packet)
	{
		return false;
	}

	fillCase(inParams, in_Case)
	{
		let packet = inParams.packet;
		in_Case.setParams({
			service: inParams.service || this.service,
			date: (new Date()).toUTCString(),
			user: packet.user,
			src_ip: packet.src_ip,
			dst_host: packet.host,
			channel: 'web',
			agent: inParams.agent.name,
			user_agent: packet.userAgent
		});
	}

	createCase(inParams)
	{
		let new_case = new Case();
		new_case.setFolder(path.join(inParams.agent.audit_fld, new_case.id));
		this.fillCase(inParams, new_case);
		return new_case;
	}

	finishCase(inParams, onDone = (err) => { if (err) throw err; })
	{
		if (inParams.agent !== undefined)
		{
			return inParams.agent.makeAudit(inParams.case, onDone);
		}
		onDone("Not set agent reference");
	}

	finishCaseSimple(inParams, in_Case, onDone = (err) => { if (err) throw err; })
	{
		let p = Object.assign({}, inParams);
		p.case = in_Case;
		return this.finishCase(p, onDone);
	}

	processDefaultPost(inParams, onDone)
	{
		let cs = this.createCase(inParams);
		let params = 
		{
			subject: "Default POST logging",
		};
		cs.setParams(params);
		cs.setBody("Default POST body", (err) => {
			this.finishCaseSimple(inParams, cs, onDone);
		});
	}

	process(inParams, onDone)
	{
		let packet = inParams.packet;
		if (packet.isLikePost)
			return this.processDefaultPost(inParams, onDone);
		console.log('Unknown how process HTTP request ' + packet.method + ' ' + packet.host + packet.url);
		return false;
	}

	createSearchCase(inParams, in_Search, onDone)
	{
		let cs = this.createCase(inParams);
		let params =
		{
			subject: inParams.packet.query.bq === undefined ? "Search" : "Fast search",
		};
		cs.setParams(params);
		cs.setBody(in_Search, err => {
			this.finishCaseSimple(inParams, cs, onDone);
		});
	}
}

module.exports = Base_Dispatcher;