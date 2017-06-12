var Base_Condition = require('./base.js');

class Contain_Condition extends Base_Condition
{
    constructor(in_Options, in_Cb)
    {
		super(in_Options, in_Cb);
        this.mask = in_Options.mask;
        this.field = in_Options.field;
		in_Cb(null, this);
    }

    isSatisfied(in_Env, in_Cb)
    {
        for (let field of this.field)
        {
            let field_value  = in_Env.case.getField(field);
            if (field_value === undefined)
                continue;
				
            for (let mask of this.mask)
            {
                let regex = new RegExp(mask);
                if (field_value.search(regex) != -1)
                {
                    return in_Cb(null, true);
                }
            }
            
        }
        return in_Cb(null, false);
    }
}

module.exports = Contain_Condition;