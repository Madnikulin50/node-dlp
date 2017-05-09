var Agent = require('../index.js');
var Case = require('../../case'); 
var fs = require('fs');
var path = require('path');


class Email_Agent extends Agent
{
    constructor(in_Options)
    {
		super(in_Options);
    }
	start()
	{
		const testFolder = this.tmp_fld;
		const fs = require('fs');
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
	makeCaseFromEml(in_File)
	{
		let new_case = new Case();
		new_case.setFolder(path.join(this.audit_fld, new_case.id));
		const simpleParser = require('mailparser').simpleParser;
		try 
		{
			var readStream = fs.createReadStream(in_File);

			simpleParser(readStream, (err, mail) => 
			{
				if (err)
				{
					fs.unlink(in_File);
					return;
				}
				var params =
				{
					date: mail.date,
					from: mail.from.text,
					to: mail.to.text,
					subject: mail.subject,
					messageId: mail.messageId,
				};
				new_case.setParams(params);
				new_case.setBody(mail.text);
				fs.unlink(in_File);
				this.makeAudit(new_case);
			});
		}
		catch (err)
		{
			console.log(err);
		}
	}
	

};

module.exports = Email_Agent;