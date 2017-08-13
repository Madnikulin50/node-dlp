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
	get name() {
		return 'unknown email agent';
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
  __makeAttachmentFileName(attachment)
  {
    let fn = attachment.filename;
    if (fn === undefined)
      fn = 'unknown';
    if (path.extname(fn).length !== 0)
      return fn;
    let contentType = attachment.contentType.split('/');
    fn = fn + '.' + (contentType.length === 2 ? contentType[1] : contentType[0]);
    return fn;
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
        if (mail.attachments !== undefined && mail.attachments.length > 0)
        {
          mail.attachments.forEach((attachment) => {
            new_case.pushAttachmentFromBuffer(this.__makeAttachmentFileName(attachment), attachment.content);
          });
        }
			
				fs.unlink(in_File, (err)=>{ console.log(err);});
				this.makeAudit(new_case, (err) => {
          if (err) 
            console.log(err);
        });
			});
		}
		catch (err)
		{
			console.log(err);
		}
	}
	

};

module.exports = Email_Agent;