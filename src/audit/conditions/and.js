var Complex_Condition = require('./complex_condition.js');

class And_Condition extends Complex_Condition
{
    constructor(in_Options)
    {
        super(in_Options);
    }    
    
    isSatisfied(in_Case)
    {
        for (let cond of this.condions)
        {
            if (!cond.isSatisfied(in_Case))
                return false;
        }
        if (this.name !== undefined)
            in_Case.pushRule(in_Case);
        return true;
    }

    executeOnDB()
    {
        
    }

};