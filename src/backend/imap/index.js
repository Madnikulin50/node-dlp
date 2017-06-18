
const imapServer = require('./server.js');
var defaultcommands = require('./defaultcommands.js');

var storeLoader = require('../../store');
class IMAP
{
	constructor(in_Options)
	{
		this.options = in_Options;
		let backend_opts = this.options.backend;
		imapServer.IMAPServer(backend_opts.imap.portnum);
		defaultcommands.SetDefaultCommands();
		imapServer.IMAPCommands.LOGIN.callback = this.login.bind(this);
		imapServer.IMAPCommands.SELECT.callback = this.select.bind(this);
		imapServer.IMAPCommands.FETCH.callback = this.fetch.bind(this);
		let storeAllOptions = in_Options.store;
		let storeOptions = storeAllOptions[storeAllOptions.active];

		let store = storeLoader(storeOptions,
		(err, store) => {
			if (err)
				throw err;
			this.store = store;
		});
	}

	login(command, socket)
	{
		let backend_opts = this.options.backend;
		let accounts = backend_opts.imap.accounts;
		for (let i in accounts)
		{
			let account = accounts[i];
			if (command.args[0] == account.user &&
				command.args[1] == account.pass)
			{
				socket.write(command.tag + " OK Welcome overwritten " + command.args[0] + "\r\n");
				socket.IMAPState = imapServer.IMAPState.Authenticated;
				return;
			}
		}
		socket.write(command.tag + " NO Wrong user or password.\r\n");
	}
	select(command, socket)
	{
		var mailbox = command.args[0];
	}

	fetch(command, socket)
	{
		var mailbox = command.args[0];
	}

	select(command, socket)
	{
		var mailbox = command.args[0];
		this.store.getNumIncidents({}, (err, result) =>
		{
			//get existent messages in mailbox
			var numExist = result.count;
			var numRecent = result.count;
			var numUnseen = result.count;

			var res = "* " + numExist + " EXISTS\r\n";

			//get recent messages

			res += "* " + numRecent + " RECENT\r\n";

			//get unseen messages

			res += "* OK [UNSEEN " + numUnseen + "] Message " + numUnseen + " is first unseen\r\n";

			res += "* OK [UIDVALIDITY 3857529045] UIDs valid\r\n";

			res += "* OK [UIDNEXT 4392] Predicted next UID\r\n";

			res += "* FLAGS (\Answered \Flagged \Deleted \Seen \Draft)\r\n";

			res += "* OK [PERMANENTFLAGS (\Deleted \Seen \*)] Limited\r\n";

			res += command.tag + " OK [READ-WRITE] SELECT completed\r\n";

			socket.write(res);
		});
		
	}

};

module.exports = IMAP;