var Action = require('./index.js');

class Block_Action extends Action
{
	
	do(in_Env, in_Callback)
	{
		this.isSatisfying(in_Env, (err, result) => {
			if (result)
			{
				console.log("Executed " + this.type + " action " + (this.name !== undefined ? this.name : "(noname)"));
				in_Env.result.block = true;
				in_Env.result.blockReason = 'Blocked by action ' + (this.name !== undefined ? this.name : "(noname)"); 
			}
			in_Callback(err, result);
		});
	}
};

module.exports = Block_Action;