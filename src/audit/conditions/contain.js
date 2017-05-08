var Condition = require('../condition.js');

class Contain_Condition extends Condition
{
    constructor(in_Options)
    {
        this.mask = in_Options.mask;
        this.field = in_Options.field;
    }

    isSatisfied(in_Case)
    {
        for (let field of this.field)
        {
            let field_value  = in_Case.getField(field);
            if (field_value === undefined)
                continue;
            for (let mask of this.mask)
            {
                let regex = new RegExp(mask);
                if (field_value.search(regex) != -1)
                {
                    if (this.name !== undefined)
                        in_Case.pushRule(in_Case);
                    return true;
                }
            }
            
        }
        return false;
    }
}