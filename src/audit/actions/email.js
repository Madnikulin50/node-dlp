var Notify_Action = require('./notify.js');

class EMail_Action extends Notify_Action
{
	doAfterAll(in_Case, onDone)
	{
		return super.doAfterAll(in_Case, onDone);
	}
};

module.exports = EMail_Action;
