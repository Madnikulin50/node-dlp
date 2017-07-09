var Agent = require('../index.js');
var Case = require('../../case'); 
var fs = require('fs');
var path = require('path');
var Site_Dispatcher = require('./sites_dispatcher');
var SiteGrabber = require('./site-grabber');

class Web_Agent extends Agent
{
    constructor(in_Options)
    {
		super(in_Options);
		this.siteDispatcher = new Site_Dispatcher(in_Options);
		if (in_Options.use_grabber === true)
			this.siteGrabber = new SiteGrabber(in_Options);
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
				if (file.endsWith(".http"))
					this.makeCaseFromHttp(path.join(testFolder, file));
			});
		});
	}
	makeCaseFromInputMessage(in_Message)
	{
		var packet = Packet.makeFromData(in_Message);
	}
	makeCaseFromHttp(in_File)
	{
		let new_case = new Case();
		new_case.setFolder(path.join(this.audit_fld, new_case.id));
		try 
		{
			var readStream = fs.createReadStream(in_File);

			/*simpleParser(readStream, (err, mail) => 
			{
				if (err)
				{
					fs.unlink(in_File);
					return;
				}
				var params =
				{
					date: mail.date,
					from: mail.from !== undefined ? mail.from.text : undefined,
					to: mail.to !== undefined ? mail.to.text : undefined,

					subject: mail.subject,
					messageId: mail.messageId,
					channel:'email'					 
				};
				if (mail.headers['x-node-dlp-agent'] !== undefined)
					params.agent = mail.header['x-node-dlp-agent']
				new_case.setParams(params);
				new_case.setBody(mail.text);
			
				fs.unlink(in_File, (err)=>{ console.log(err);});
				this.makeAudit(new_case);
			});*/
			fs.unlink(in_File, (err)=>{ console.log(err);});
		}
		catch (err)
		{
			console.log(err);
		}
	}
	

};

module.exports = Web_Agent;