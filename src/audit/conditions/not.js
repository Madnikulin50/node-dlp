var Base_Condition = require('./base');
var creator = require('./index.js');

class Not_Condition extends Base_Condition
{
    constructor(in_Options, in_Cb)
    {
		super(in_Options, in_Cb);
		creator(in_Options.condition, (err, result) => {
			if (err)
				return in_Cb(err);
			this.condition = result;
			in_Cb(null, this);
		});

    }    
    
    isSatisfied(in_Env, in_Cb)
    {
        return this.condition.isSatisfied(in_Env, (err, result) => {
			if (err)
				return in_Cb(err, result);
			return in_Cb(err, !result);
		});
    }

    executeOnDB()
    {
        
    }

};

module.exports = Not_Condition;