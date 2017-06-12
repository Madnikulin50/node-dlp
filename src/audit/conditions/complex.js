var Base_Condition = require('./base.js');
var creator = require('./index.js');
var async = require('async');

class Complex_Condition extends Base_Condition
{
    constructor(in_Options, in_Cb)
    {
		super(in_Options, (err) => {
			if (err)
				return in_Cb(err);
			this.conditions = [];
			if (in_Options.conditions)
			{
				async.each(in_Options.conditions, (cond_opt, callback) => {
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
				for (var cond_opt of in_Options)
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