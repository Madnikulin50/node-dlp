var Complex_Condition = require('./complex_condition.js');
var async = require('async');

class Or_Condition extends Complex_Condition
{
    constructor(inOptions, in_Cb)
    {
        super(inOptions, in_Cb);

    }    
    
    isSatisfied(in_Env, in_Cb)
    {
		var counter = 0;
		async.each(this.condions, (condition, callback) => {
			condition.isSatisfied(in_Env, (err, result) => {
				if (result)
					counter++;
				callback(err);
			}),
			(err) => {
				in_Cb(err, counter > 0);
			}
		});
    }

    executeOnDB()
    {
        
    }

};

module.exports = Or_Condition;