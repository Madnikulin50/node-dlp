var Base_Condition = require('./base.js');
var creator = require('./index.js');
var async = require('async');

class Complex_Condition extends Base_Condition
{
    constructor(inOptions, in_Cb)
    {
		super(inOptions, (err) => {
			if (err)
				return in_Cb(err);
			this.conditions = [];
			if (inOptions.conditions)
			{
				async.each(inOptions.conditions, (cond_opt, callback) => {
					creator(cond_opt, (err, result) => {
						if (err)
							return callback();
						this.conditions.push(result);
						callback();
					 });
				},
				(err) => {
					in_Cb(null, this);
				})
				for (var cond_opt of inOptions)
				{
					
				}
			}			
		});
    }    
    
    isSatisfied(in_Env)
    {
        return true;
    }

    executeOnDB()
    {
        
    }

};

module.exports = Complex_Condition;