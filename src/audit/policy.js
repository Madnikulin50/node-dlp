var conditions_creator = require('./conditions');
var async =  require('async');

class Policy
{
    constructor()
    {
		
    }
    
    load(inOptions, in_Cb)
    {
		Object.assign(this, inOptions);
		this.name = inOptions.name;
		this.conditions = [];
		
		if (inOptions.condition === undefined)
		{
			return in_Cb(null, this);
		}
		let conditions;
		if (!Array.isArray(inOptions.condition))
			conditions = [ inOptions.condition ];
		else
			conditions = inOptions.condition;


		async.each(conditions, (condition, callback) => {
			conditions_creator(condition, (err, result) => {
				if (err)
					return callback(err);
				this.conditions.push(result);
				callback(err);
			});
		},
		(err) => {
			in_Cb(err, this);
		});
    }


    isSatisfied(in_Env, in_Cb)
    {
		if (this.condition === null)
			return in_Cb(null, true);
		let counter = 0;
		async.each(this.conditions, (condition, callback) => {
			condition.isSatisfied(in_Env, (err, result) => {
				if (result === true)
					counter++;
				callback();
			})
		},
		(err) => {
			in_Cb(err, counter > 0);
		});
    }

    executeOnDB()
    {
        
    }

};

module.exports = function(inOptions, in_Cb)
{
	let policy = new Policy();
	return policy.load(inOptions, in_Cb);
};