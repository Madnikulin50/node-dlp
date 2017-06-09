
class Analyse_Log
{
	constructor()
	{
		this.elems = [];
	}
	pushText(in_String)
	{
		this.push(in_String);
	}

	pushPolicyApply(in_Policy, in_Condition, in_Info)
	{
		this.push({
			text: "Apply police" + in_Policy + " by condition " + in_Condition,
			policy: in_Policy, 
			condition: in_Condition, 
			info: in_Info
		})
	}

	push(in_Elem)
	{
		this.elems(in_Elem);
	}
};

module.exports = Analyse_Log;