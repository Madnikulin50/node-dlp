var Base_Dispatcher = require('../base.js');

class Facebook_Dispatcher extends Base_Dispatcher
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
		return 'Facebook';
	}

};

module.exports = Facebook_Dispatcher;