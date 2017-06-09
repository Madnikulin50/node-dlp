var Complex_Condition = require('./complex_condition.js');

class And_Condition extends Complex_Condition
{
    constructor(in_Options, in_Cb)
    {
        super(in_Options, in_Cb);
    }    
    
    isSatisfied(in_Env)
    {
        var counter = 0;
		async.each(this.condions, (condition, callback) => {
			condition.isSatisfied(in_Env, (err, result) => {
				if (result)
					counter++;
				callback(err);
			}),
			(err) => {
				in_Cb(err, counter == his.condions.length);
			}
		});
    }

    executeOnDB()
    {
        
    }

};

module.exports = And_Condition;