var Notify_Action = require('./notify.js');

class EMail_Action extends Notify_Action
{
	doAfterAll(in_Case, in_Callback)
	{
		return super.doAfterAll(in_Case, in_Callback);
	}
};

module.exports = EMail_Action;
