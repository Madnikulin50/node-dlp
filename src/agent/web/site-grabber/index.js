const phantom = require("phantom");

class SiteGrabber
{
	constructor(in_Options = {}) {
		this._options = Object.assign({},  in_Options);
	}

	grab(in_Params, in_CB) {
		var params = in_Params;
		this.execute({
			url: in_Params.url
		}, (err, content) => {
			let new_case = new Case();
			new_case.setFolder(path.join(in_Params.agent.audit_fld, new_case.id));
			let packet = in_Params.packet;
			new_case.setParams({
				service: in_Params.service || this.service,
				date: (new Date()).toUTCString(),
				user: packet.user,
				src_ip: packet.src_ip,
				dst_host: packet.host,
				channel: 'web',
				agent: in_Params.agent.name,
				user_agent: packet.userAgent
			});
			if (this._options.agent !== undefined)
			{
				return in_Params.agent.makeAudit(in_Params.case, in_CB);
			}
		});
		in_CB();
	}


	_executeOnInstance(in_Params, in_CB) {
		this._instance.createPage().then(page => {
			page.on("onResourceRequested", function(requestData) {
				console.info('Requesting ', requestData.url)
			});
		
			page.open(in_Params.url).then(status => {
				console.log(status);
				page.property('plainText').then(content => {
					console.log(content);
					in_CB(null, content);
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

