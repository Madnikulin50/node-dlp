var Condition = require('../condition.js');

class Not_Condition extends Condition
{
    constructor(in_Options)
    {
        this.condition = this.Condition.create(in_Options.condition);
    }    
    
    isSatisfied(in_Case)
    {
        return !this.condition.isSatisfied(in_Case);
    }

    executeOnDB()
    {
        
    }

};