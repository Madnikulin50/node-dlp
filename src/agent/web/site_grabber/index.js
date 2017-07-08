const phantom = require("phantom");

class SiteGrabber
{
	constructor(in_Options = {}) {
		this._options = Object.assign({},  in_Options);
	}

	execute(in_Params, in_CB) {
		var _ph, _page, _outObj;

		phantom.create().then(ph => {
			_ph = ph;
			return _ph.createPage();
		}).then(page => {
			_page = page;
			return _page.open(in_Param.url);
		}).then(status => {
			console.log(status);
			return _page.property('content')
		}).then(content => {
			console.log(content);
			_page.close();
			_ph.exit();
			in_CB(null, content);
		}).catch(e => {
			console.log(e);
			in_CB(e);
		});
	}
};

module.exports = SiteGrabber;

