var Email_Sheduled_Agent = require('../sheduled.js');
var path = require('path');
var fs = require('fs'), fileStream;
var Imap = require('imap'), inspect = require('util').inspect;

class IMAP4_Agent extends Email_Sheduled_Agent
{
    constructor(in_Options)
    { 
        
        super(in_Options);
        Object.assign(this, in_Options);
    }

    do()
    {
        console.log("Starting IMAP4 task\nserver - " + this.server + ":" + this.port +  (this.tls ? 'tls' : 'plain') + "\nuser - " + this.user);

        var imap = new Imap(
        {
			user: this.user,
			password: this.pass,
            host: this.server,
            port: this.port,
            tls: this.tls
        });
        imap.once('ready', function() 
        {
			imap.openBox('INBOX', true, function(err, box) 
    		{
  				if (err)
				  throw err;
				imap.search([ 'UNSEEN', ['SINCE', 'May 20, 2010'] ], function(err, results) 
				{
    				if (err) 
						throw err;
    				var f = imap.fetch(results, { bodies: '' });
    				f.on('message', function(msg, seqno) 
					{
      					console.log('Message #%d', seqno);
      					var prefix = '(#' + seqno + ') ';
      					msg.on('body', function(stream, info) 
						{
							console.log(prefix + 'Body');
							stream.pipe(fs.createWriteStream(path.join(this.tmp_fld, 'msg-' + seqno + '-body.eml')));
						}.bind(this));
						msg.once('attributes', function(attrs) 
						{
							console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
						});
						msg.once('end', function()
						{
							console.log(prefix + 'Finished');
						});
					}.bind(this));
					f.once('error', function(err) 
					{
						console.log('Fetch error: ' + err);
					});
					f.once('end', function() 
					{
						console.log('Done fetching all messages!');
						imap.end();
					});
				}.bind(this));
			}.bind(this));
		}.bind(this));
		imap.once('error', function(err) 
		{
			console.log(err);
		});

		imap.once('end', function()
		{
			console.log('Connection ended');
		});

		imap.connect();

    }
};

module.exports = IMAP4_Agent;
