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

};

module.exports = Google_Dispatcher;