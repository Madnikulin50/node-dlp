
class Base_Condition
{
	constructor(in_Options, in_Cb)
	{
		Object.assign(this, in_Options);
	}

	isSatisfied(in_Env, in_Cb)
    {
        return in_Cb(null, true);
    }

	executeOnDB()
    {
        
    }
};

module.exports = Base_Condition;