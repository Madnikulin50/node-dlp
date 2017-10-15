
class Base_Condition
{
	constructor(inOptions, in_Cb)
	{
		Object.assign(this, inOptions);
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