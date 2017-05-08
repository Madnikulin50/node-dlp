var Condition = require('./condtion.js'); 

class Rule
{
    constructor(in_Options)
    {
        this.id = in_Options.id;
        this.name = in_Options.name;
        this.condition = Condition.create(cond_type, in_Options);
    }

    execute(in_Case)
    {

    }

    executeOnDB()
    {
        
    }

};