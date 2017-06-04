var Options = require('../options');

let instance = null;

class Audit
{
    constructor(in_Options)
    {
		if (instance)
			return instance;
		instance = this;
		if (in_Options)
			instance.loadOptions(in_Options);
	
		return instance;
    }
	static get()
	{
		return instance;
	}

	loadOptions(in_Options)
	{
		Object.assign(instance, in_Options.get);
		this.actions = [];
		let audit_opts = in_Options.audit;
		audit_opts.actions.forEach((element)=>
		{
			let action = require(__dirname + '/actions/' + element.type + '.js');
			this.actions.push(new action(element));
		});

		const fs = require('fs');
		const options = new Options();
		const testFolder = options.agents.common.audit_fld;
		fs.readdir(testFolder, (err, files) => 
		{
			if (err)
			{
				console.log(err);
				return;
			}
			files.forEach((file) => 
			{
				if (file.endsWith(".eml"))
					this.makeCaseFromEml(path.join(testFolder, file));
			});
		});
	}

    execute(in_Case, in_Callback = (err) => { if (err) throw err; } )
    {
		let err = null;
		let result = {};
		this.actions.forEach((element)=>
		{
			element.do(in_Case);
		});
		if (in_Callback)
			in_Callback(err, result);
		
    }

    executeOnDB()
    {
        
    }

};

module.exports = Audit;