const phantom = require("phantom");
const Case = require('../../../case');
const path = require("path");
const Optimizer = require("./optimizer")

class SiteGrabber
{
	constructor(in_Options = {}) {
		this._options = Object.assign({},  in_Options);
		this._optimizer = new Optimizer(this._options);
	}

	needGrab(in_Packet) {
		let url = in_Packet.url;
		if (url.indexOf('.html') !== -1)
			return true;
		if (url.indexOf('.shtml') !== -1)
			return true;
		if (url.indexOf('.js') !== -1)
			return false;
		if (url.indexOf('.css') !== -1)
			return false;
		if (url.indexOf('.map') !== -1)
			return false;
		return in_Packet.isMainRequest;
	}

	grab(in_Params, in_CB) {
		var params = in_Params;
		this.execute({
			url: params.packet.fullPath
		}, (err, data) => {
			if (err) {
				console.log(err);
				return;
			}
			if (data === undefined) {
				return;
			}
			if (data.plainText.length === 0)
				return;
			let new_case = new Case();
			new_case.setFolder(path.join(params.agent.audit_fld, new_case.id));
			let packet = params.packet;
			new_case.setParams({
				service: params.service || this.service,
				date: (new Date()).toUTCString(),
				user: packet.user,
				src_ip: packet.srcIp,
				dst_host: packet.host,
				channel: 'web',
				agent: params.agent.name,
				user_agent: packet.userAgent,
				subject: data.title
			});
			new_case.setBody(data.plainText, (err) => {
				if (params.agent !== undefined)
				{
					return params.agent.makeAudit(new_case, in_CB);
				}
			});
			
		});
		in_CB();
	}


	_executeOnInstance(in_Params, in_CB) {

		this._instance.createPage().then(page => {
			page.on("onResourceRequested", (requestData/*, networkRequest*/) => {
				if (this._optimizer.needBlock(requestData.url))
				{
					console.info('Block requesting TODO ', requestData.url);
					//networkRequest.abort();
					return;
				}
				console.info('Requesting ', requestData.url);
			});
			let data = {
				title:"",
				plainText:""
			};
		
			page.open(in_Params.url).then(status => {
				console.log(status);
				page.property('plainText').then(content => {
					if (content.length === 0)
						return in_CB(null);
					data.plainText = content;
					return page.property('title');
				}).then(title => {
					data.title = title;
					in_CB(null, data);
				}).catch(err => in_CB(err));
			}).catch(err => in_CB(err));
		}).catch(err => in_CB(err));
	}

	execute(in_Params, in_CB) {
		if (this._instance !== undefined)
			return this._executeOnInstance(in_Params, in_CB);
		phantom.create(['--ignore-ssl-errors=yes',
		 '--load-images=no', 
		 '--disk-cache=true']).then(instance => {
			this._instance = instance;
			this._executeOnInstance(in_Params, in_CB);
		}).catch(err => in_CB(err));
		
 
	}
		/*
			return ph.createPage((err, page) => {
				
				return page.open(in_Params.url, function(err,status) {
					console.log("opened site? ", status);
					/*page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function (err) {
						//jQuery Loaded. 
						//Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds. 
						setTimeout(function () {
							return page.evaluate(function () {
								//Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object. 
								var h2Arr = [],
									pArr = [];
								$('h2').each(function () {
									h2Arr.push($(this).html());
								});
								$('p').each(function () {
									pArr.push($(this).html());
								});

								return {
									h2: h2Arr,
									p: pArr
								};
							}, function (err, result) {
								console.log(result);
								ph.exit();
							});
						}, 5000);
					});
				});
			});
		}, {phantomPath:__dirname + '/../../../../node_modules/.bin/phantomjs'});
	}*/
};

module.exports = SiteGrabber;

