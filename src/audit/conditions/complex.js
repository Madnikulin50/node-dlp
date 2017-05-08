var Condition = require('../condition.js');

class Complex_Condition extends Condition
{
    constructor(in_Options)
    {
        this.conditions = [];
        if (in_Options.conditions)
        {
            for (var cond_opt of in_Options)
            {
                this.conditions = this.Condition.create(cond_opt);
            }
        }
    }    
    
    isSatisfied(in_Case)
    {
        return true;
    }

    executeOnDB()
    {
        
    }

};